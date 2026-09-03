package com.alumni.platform.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiGatewayApplicationTests {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void contextLoads() {
    }

    @Test
    void routesAreConfigured() {
        var routes = routeLocator.getRoutes()
                .map(route -> route.getId())
                .collectList()
                .block();

        assertThat(routes).contains(
                "identity-service",
                "profile-service",
                "institution-service",
                "mentorship-service",
                "booking-service",
                "review-service",
                "notification-service"
        );
    }
}