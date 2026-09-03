package com.alumni.platform.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }
        String finalCorrelationId = correlationId;

        // Add to request headers for downstream
        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, finalCorrelationId)
                .build();

        // Log request (safe)
        logRequest(request, finalCorrelationId);

        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .doOnSuccess(v -> logResponse(exchange.getResponse(), finalCorrelationId));
    }

    private void logRequest(ServerHttpRequest request, String correlationId) {
        StringBuilder sb = new StringBuilder();
        sb.append("cid=").append(correlationId)
          .append(" method=").append(request.getMethod())
          .append(" path=").append(request.getPath())
          .append(" query=").append(request.getQueryParams().toSingleValueMap())
          .append(" remote=").append(request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress() : "unknown");
        // Do not log sensitive headers
        log.info("Incoming request: {}", sb);
    }

    private void logResponse(org.springframework.http.server.reactive.ServerHttpResponse response, String correlationId) {
        log.info("Outgoing response: cid={} status={}", correlationId, response.getStatusCode());
    }

    @Override
    public int getOrder() {
        return -1; // run early
    }
}