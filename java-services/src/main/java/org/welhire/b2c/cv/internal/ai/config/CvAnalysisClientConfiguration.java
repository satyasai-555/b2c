package org.welhire.b2c.cv.internal.ai.config;

import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.core5.util.Timeout;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import org.welhire.b2c.cv.internal.ai.client.CvAnalysisApi;
import org.welhire.b2c.cv.internal.ai.client.CvAnalysisClient;
import org.welhire.b2c.cv.internal.ai.validation.CvAnalysisResponseValidator;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        prefix = "integrations.ai.cv-analysis",
        name = "enabled",
        havingValue = "true"
)
public class CvAnalysisClientConfiguration {

    @Bean(destroyMethod = "close")
    CloseableHttpClient cvAnalysisHttpClient(
            @Value("${integrations.ai.cv-analysis.connect-timeout}")
            Duration connectTimeout
    ) {
        requirePositive(connectTimeout, "connect-timeout");

        var connectionConfig = ConnectionConfig.custom()
                .setConnectTimeout(
                        Timeout.ofMilliseconds(connectTimeout.toMillis())
                )
                .build();

        var connectionManager =
                PoolingHttpClientConnectionManagerBuilder.create()
                        .setDefaultConnectionConfig(connectionConfig)
                        .setMaxConnTotal(20)
                        .setMaxConnPerRoute(10)
                        .build();

        return HttpClients.custom()
                .setConnectionManager(connectionManager)
                .disableAutomaticRetries()
                .disableRedirectHandling()
                .disableCookieManagement()
                .evictExpiredConnections()
                .build();
    }

    @Bean
    CvAnalysisApi cvAnalysisApi(
            RestClient.Builder builder,
            @Qualifier("cvAnalysisHttpClient")
            CloseableHttpClient httpClient,
            @Value("${integrations.ai.cv-analysis.read-timeout}")
            Duration readTimeout,
            @Value("${integrations.ai.cv-analysis.pool-acquire-timeout}")
            Duration poolAcquireTimeout,
            @Value("${integrations.ai.cv-analysis.auth-header}")
            String authHeader,
            @Value("${integrations.ai.cv-analysis.auth-value}")
            String authValue
    ) {
        requirePositive(readTimeout, "read-timeout");
        requirePositive(poolAcquireTimeout, "pool-acquire-timeout");

        if (authHeader == null
                || !authHeader.matches("[A-Za-z0-9-]+")) {
            throw new IllegalArgumentException(
                    "A valid AI authentication header name is required"
            );
        }

        if (authValue == null
                || authValue.isBlank()
                || authValue.contains("\r")
                || authValue.contains("\n")) {
            throw new IllegalArgumentException(
                    "A valid AI authentication header value is required"
            );
        }

        var requestFactory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        requestFactory.setReadTimeout(readTimeout);
        requestFactory.setConnectionRequestTimeout(poolAcquireTimeout);

        RestClient restClient = builder.clone()
                .requestFactory(requestFactory)
                .defaultHeader(authHeader, authValue)
                .defaultStatusHandler(
                        status -> !status.is2xxSuccessful(),
                        (request, response) -> {
                            // Do not include sensitive AI error bodies.
                            throw new RestClientResponseException(
                                    "AI returned a non-success HTTP status",
                                    response.getStatusCode().value(),
                                    "",
                                    null,
                                    new byte[0],
                                    StandardCharsets.UTF_8
                            );
                        }
                )
                .build();

        return HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(restClient))
                .build()
                .createClient(CvAnalysisApi.class);
    }

    @Bean
    CvAnalysisClient cvAnalysisClient(
            CvAnalysisApi api,
            CvAnalysisResponseValidator responseValidator,
            @Value("${integrations.ai.cv-analysis.base-url}")
            String baseUrl,
            @Value("${integrations.ai.cv-analysis.path}")
            String path
    ) {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "AI analysis base-url is required"
            );
        }

        URI base = URI.create(baseUrl);

        if (!base.isAbsolute()
                || base.getHost() == null
                || base.getUserInfo() != null
                || base.getQuery() != null
                || base.getFragment() != null
                || (!"https".equalsIgnoreCase(base.getScheme())
                && !"http".equalsIgnoreCase(base.getScheme()))) {
            throw new IllegalArgumentException(
                    "AI base-url must be a valid HTTP or HTTPS URL"
            );
        }

        if (!base.getPath().isEmpty() && !"/".equals(base.getPath())) {
            throw new IllegalArgumentException(
                    "AI base-url must contain only the server origin; "
                            + "configure the endpoint using path"
            );
        }

        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException(
                    "AI analysis path is required"
            );
        }

        URI relativePath = URI.create(path);

        if (!path.startsWith("/")
                || relativePath.isAbsolute()
                || relativePath.getRawAuthority() != null
                || relativePath.getQuery() != null
                || relativePath.getFragment() != null) {
            throw new IllegalArgumentException(
                    "AI path must start with / "
                            + "and contain no host, query or fragment"
            );
        }

        return new CvAnalysisClient(
                api,
                base.resolve(relativePath),
                responseValidator
        );
    }

    private static void requirePositive(Duration value, String name) {
        if (value == null
                || value.isNegative()
                || value.isZero()
                || value.toMillis() < 1) {
            throw new IllegalArgumentException(
                    name + " must be at least 1 millisecond"
            );
        }
    }
}