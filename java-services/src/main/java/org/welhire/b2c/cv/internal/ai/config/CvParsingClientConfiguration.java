package org.welhire.b2c.cv.internal.ai.config;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
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
import org.welhire.b2c.cv.internal.ai.client.CvParsingApi;
import org.welhire.b2c.cv.internal.ai.client.CvParsingClient;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.core5.util.Timeout;
import org.welhire.b2c.cv.internal.ai.mock.MockCvParsingApi;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        prefix = "integrations.ai.cv-parsing",
        name = "enabled",
        havingValue = "true"
)
public class CvParsingClientConfiguration {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(
            prefix = "integrations.ai.cv-parsing",
            name = "mock-enabled",
            havingValue = "false",
            matchIfMissing = true
    )
    CloseableHttpClient cvParsingHttpClient(
            @Value("${integrations.ai.cv-parsing.connect-timeout}")
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
    @ConditionalOnProperty(
            prefix = "integrations.ai.cv-parsing",
            name = "mock-enabled",
            havingValue = "false",
            matchIfMissing = true
    )
    CvParsingApi cvParsingApi(
            RestClient.Builder builder,
            @Qualifier("cvParsingHttpClient")
            CloseableHttpClient httpClient,
            @Value("${integrations.ai.cv-parsing.read-timeout}")
            Duration readTimeout,
            @Value("${integrations.ai.cv-parsing.pool-acquire-timeout}")
            Duration poolAcquireTimeout,
            @Value("${integrations.ai.cv-parsing.auth-header}")
            String authHeader,
            @Value("${integrations.ai.cv-parsing.auth-value}")
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

        RestClient restClient = builder
                .requestFactory(requestFactory)
                .defaultHeader(authHeader, authValue)
                .defaultStatusHandler(
                        status -> !status.is2xxSuccessful(),
                        (request, response) -> {
                            // Do not copy an AI error body into exceptions:
                            // it may contain CV data or other sensitive content.
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
                .createClient(CvParsingApi.class);
    }

    @Bean
    @ConditionalOnProperty(
            prefix = "integrations.ai.cv-parsing",
            name = "mock-enabled",
            havingValue = "false",
            matchIfMissing = true
    )
    CvParsingClient cvParsingClient(
            CvParsingApi api,
            @Value("${integrations.ai.cv-parsing.base-url}")
            String baseUrl,
            @Value("${integrations.ai.cv-parsing.path}")
            String path,
            @Value("${integrations.ai.cv-parsing.max-file-bytes}")
            int maxFileBytes
    ) {
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

        URI relativePath = URI.create(path);

        if (!path.startsWith("/")
                || relativePath.isAbsolute()
                || relativePath.getRawAuthority() != null
                || relativePath.getQuery() != null
                || relativePath.getFragment() != null) {
            throw new IllegalArgumentException(
                    "AI path must start with / and contain no host, query or fragment"
            );
        }

        return new CvParsingClient(
                api,
                base.resolve(relativePath),
                maxFileBytes
        );
    }

    @Bean
    @ConditionalOnProperty(
            prefix = "integrations.ai.cv-parsing",
            name = "mock-enabled",
            havingValue = "true"
    )
    CvParsingApi mockCvParsingApi() {
        return new MockCvParsingApi();
    }

    @Bean
    @ConditionalOnProperty(
            prefix = "integrations.ai.cv-parsing",
            name = "mock-enabled",
            havingValue = "true"
    )
    CvParsingClient mockCvParsingClient(
            CvParsingApi api,
            @Value("${integrations.ai.cv-parsing.max-file-bytes}")
            int maxFileBytes
    ) {
        return new CvParsingClient(
                api,
                URI.create("https://mock.invalid/cv_parsing/"),
                maxFileBytes
        );
    }

    private static void requirePositive(Duration value, String name) {
        if (value == null || value.isNegative() || value.isZero()) {
            throw new IllegalArgumentException(name + " must be positive");
        }
    }
}
