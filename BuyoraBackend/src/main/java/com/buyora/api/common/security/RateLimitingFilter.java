package com.buyora.api.common.security;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private record Entry(Bucket bucket, long expiresAt) {}
    private final Map<String, Entry> clients = new HashMap<>();
    private final Bucket overflow = bucket(100);
    private static Bucket bucket(int capacity) { return Bucket.builder().addLimit(limit -> limit.capacity(capacity).refillGreedy(capacity, Duration.ofMinutes(1))).build(); }
    private synchronized Bucket limit(String key, boolean authentication) {
        long now = System.currentTimeMillis();
        Entry existing = clients.get(key);
        if (existing != null && existing.expiresAt() > now) return existing.bucket();
        if (clients.size() >= 10000) clients.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
        if (clients.size() >= 10000 && existing == null) return overflow;
        Bucket bucket = bucket(authentication ? 10 : 100);
        clients.put(key, new Entry(bucket, now + Duration.ofMinutes(10).toMillis()));
        return bucket;
    }
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().equals("/actuator/health") || request.getRequestURI().startsWith("/api/v1/payments/webhooks/");
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        boolean authentication = "POST".equals(request.getMethod()) && request.getRequestURI().startsWith("/api/v1/auth/");
        if (limit(request.getRemoteAddr() + (authentication ? ":auth" : ":api"), authentication).tryConsume(1)) { chain.doFilter(request, response); return; }
        response.setStatus(429); response.setContentType("application/json"); response.setHeader("Retry-After", "60");
        response.getWriter().write("{\"status\":429,\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests. Please try again shortly.\"}");
    }
}
