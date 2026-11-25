package org.welhire.b2c.cv.internal.config;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Configuration(proxyBeanMethods = false)
public class AzureBlobConfiguration {

    @Bean
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
}