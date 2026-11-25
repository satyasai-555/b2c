package org.welhire.b2c.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration(proxyBeanMethods = false)
public class SessionCookieConfiguration {

    @Bean
    CookieSerializer cookieSerializer(
            @Value("${app.session.secure-cookie:true}")
            boolean secureCookie
    ) {
        DefaultCookieSerializer serializer =
                new DefaultCookieSerializer();

        serializer.setCookieName(
                secureCookie
                        ? "__Host-b2c_session"
                        : "b2c_session"
        );

        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(secureCookie);
        serializer.setSameSite("Lax");

        // Session cookie: no persistent browser lifetime is configured.
        serializer.setCookieMaxAge(-1);

        return serializer;
    }
}