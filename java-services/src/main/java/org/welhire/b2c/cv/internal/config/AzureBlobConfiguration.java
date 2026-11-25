package org.welhire.b2c.cv.internal.config;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobCorsRule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.net.URI;
import java.util.List;

@Configuration(proxyBeanMethods = false)
public class AzureBlobConfiguration {

    @Bean
    @Profile("!local")
    BlobServiceClient cvBlobServiceClient(
            @Value("${app.storage.azure.endpoint}")
            String endpoint
    ) {
        URI uri = URI.create(endpoint);

        if (!"https".equalsIgnoreCase(uri.getScheme())
                || uri.getHost() == null
                || uri.getUserInfo() != null
                || uri.getQuery() != null
                || uri.getFragment() != null
                || (!uri.getPath().isEmpty()
                && !"/".equals(uri.getPath()))) {
            throw new IllegalArgumentException(
                    "Azure endpoint must be an HTTPS storage account origin"
            );
        }

        return new BlobServiceClientBuilder()
                .endpoint(endpoint)
                .credential(
                        new DefaultAzureCredentialBuilder().build()
                )
                .buildClient();
    }

    @Bean("cvBlobServiceClient")
    @Profile("local")
    BlobServiceClient localCvBlobServiceClient(
            @Value("${app.storage.azure.connection-string}")
            String connectionString,

            @Value("${app.storage.azure.cv-container}")
            String containerName,

            @Value("${app.storage.azure.allowed-origin}")
            String allowedOrigin
    ) {
        BlobServiceClient client =
                new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();

        client.getBlobContainerClient(containerName)
                .createIfNotExists();

        BlobCorsRule corsRule = new BlobCorsRule()
                .setAllowedOrigins(allowedOrigin)
                .setAllowedMethods("PUT,OPTIONS")
                .setAllowedHeaders(
                        "Content-Type,x-ms-blob-type,If-None-Match"
                )
                .setExposedHeaders("ETag,x-ms-request-id")
                .setMaxAgeInSeconds(3600);

        var properties = client.getProperties();

        properties.setCors(List.of(corsRule));

        client.setProperties(properties);

        return client;
    }
}