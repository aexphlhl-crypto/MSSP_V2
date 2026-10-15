package com.mspportal.application.config;

import com.mspportal.subscription.interceptor.SubscriptionInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SubscriptionInterceptor subscriptionInterceptor;

    public WebMvcConfig(SubscriptionInterceptor subscriptionInterceptor) {
        this.subscriptionInterceptor = subscriptionInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(subscriptionInterceptor)
                .addPathPatterns("/api/dashboard/**")
                .addPathPatterns("/api/v1/monitoring/**")
                .addPathPatterns("/api/v1/backup/**")
                .addPathPatterns("/api/v1/security/**")
                .addPathPatterns("/api/v1/tickets/**");
    }
}
