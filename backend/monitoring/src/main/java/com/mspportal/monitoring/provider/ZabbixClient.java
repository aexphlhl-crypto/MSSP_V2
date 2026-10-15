package com.mspportal.monitoring.provider;

import com.mspportal.integrationcore.credential.ProviderCredentialManager;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderCredential;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ZabbixClient {

    private static final Logger log = LoggerFactory.getLogger(ZabbixClient.class);

    private final ProviderCredentialManager credentialManager;
    private final ProviderConnectionRepository connectionRepository;
    private final RestTemplate restTemplate;

    // In-memory token cache: connectionId → auth token
    private final Map<UUID, String> tokenCache = new ConcurrentHashMap<>();

    public ZabbixClient(ProviderCredentialManager credentialManager,
                        ProviderConnectionRepository connectionRepository) {
        this.credentialManager = credentialManager;
        this.connectionRepository = connectionRepository;

        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Authentication
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Returns a valid auth token, using cache if available.
     */
    public String authenticate(UUID connectionId) {
        if (tokenCache.containsKey(connectionId)) {
            return tokenCache.get(connectionId);
        }
        return authenticateFresh(connectionId);
    }

    /**
     * Forces a fresh authentication, ignoring any cached token.
     * Use when a cached token has expired (Zabbix returns an auth error).
     */
    public String authenticateFresh(UUID connectionId) {
        tokenCache.remove(connectionId);

        ProviderConnection conn = connectionRepository.findByIdNative(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + connectionId));

        ProviderCredential cred = credentialManager.getCredential(connectionId)
                .orElseThrow(() -> new IllegalStateException("Credentials not found for connection: " + connectionId));

        String secret = cred.getSecretValue();
        String username = "";
        String password = "";

        if (secret != null && secret.trim().startsWith("{")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, String> credMap = mapper.readValue(secret, Map.class);
                username = credMap.getOrDefault("username", "");
                password = credMap.getOrDefault("password", "");
            } catch (Exception e) {
                log.error("Failed to parse JSON credentials for Zabbix connection {}: {}", connectionId, e.getMessage());
            }
        }

        if (username == null || username.isEmpty()) {
            if (secret != null && secret.contains(":")) {
                String[] parts = secret.split(":", 2);
                username = parts[0];
                password = parts[1];
            } else {
                username = "Admin";
                password = secret != null ? secret : "";
            }
        }

        String url = buildApiUrl(conn);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("jsonrpc", "2.0");
        requestBody.put("method", "user.login");

        Map<String, Object> params = new HashMap<>();
        params.put("username", username);
        params.put("password", password);
        requestBody.put("params", params);

        requestBody.put("id", 1);
        requestBody.put("auth", null);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Zabbix fresh authentication for connection {} at {}", connectionId, url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                if (body.containsKey("error")) {
                    Map errorObj = (Map) body.get("error");
                    String errMessage = errorObj != null ? (String) errorObj.get("data") : "Unknown auth error";
                    throw new RuntimeException("Zabbix auth error: " + errMessage);
                }
                String token = (String) body.get("result");
                if (token != null && !token.isEmpty()) {
                    tokenCache.put(connectionId, token);
                    log.info("Zabbix authenticated successfully for connection {}", connectionId);
                    return token;
                }
            }
            throw new RuntimeException("Zabbix login returned empty token");
        } catch (Exception e) {
            log.error("Zabbix authentication FAILED for connection {}: {}", connectionId, e.getMessage());
            throw new RuntimeException("Zabbix login failed: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // API Methods
    // ──────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getHosts(UUID connectionId) {
        return callWithTokenRefresh(connectionId, (token) -> {
            String url = buildApiUrl(connectionId);
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("jsonrpc", "2.0");
            requestBody.put("method", "host.get");

            Map<String, Object> params = new HashMap<>();
            params.put("output", Arrays.asList("hostid", "host", "name", "status", "available", "error"));
            params.put("selectInterfaces", Arrays.asList("ip", "main"));
            requestBody.put("params", params);
            requestBody.put("id", 2);
            requestBody.put("auth", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            checkApiResponse(response, "host.get");
            List<Map<String, Object>> result = (List<Map<String, Object>>) response.getBody().get("result");
            log.info("Zabbix host.get returned {} hosts for connection {}", result != null ? result.size() : 0, connectionId);
            return result != null ? result : Collections.emptyList();
        }, "host.get", connectionId);
    }

    /**
     * Fetches all items for a given Zabbix host ID.
     * Retries once with a fresh token if the session is expired.
     */
    public List<Map<String, Object>> getItems(UUID connectionId, String hostId) {
        log.info("Fetching Zabbix items for connection={}, hostId={}", connectionId, hostId);
        return callWithTokenRefresh(connectionId, (token) -> {
            String url = buildApiUrl(connectionId);
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("jsonrpc", "2.0");
            requestBody.put("method", "item.get");

            Map<String, Object> params = new HashMap<>();
            params.put("hostids", Collections.singletonList(hostId));
            params.put("output", Arrays.asList("itemid", "name", "key_", "value_type", "units", "lastvalue", "lastclock", "state"));
            // Only return enabled items with numeric value types (0=float, 3=unsigned int)
            params.put("filter", Map.of("state", "0"));  // state 0 = normal
            requestBody.put("params", params);
            requestBody.put("id", 3);
            requestBody.put("auth", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            checkApiResponse(response, "item.get");
            List<Map<String, Object>> result = (List<Map<String, Object>>) response.getBody().get("result");
            int count = result != null ? result.size() : 0;
            log.info("Zabbix item.get returned {} items for connection={}, hostId={}", count, connectionId, hostId);
            if (count > 0) {
                result.forEach(item ->
                    log.info("  item: name='{}' key='{}' lastvalue='{}'",
                            item.get("name"), item.get("key_"), item.get("lastvalue")));
            }
            return result != null ? result : Collections.emptyList();
        }, "item.get", connectionId);
    }

    /**
     * Fetches current problems for a given Zabbix host ID.
     * Retries once with a fresh token if the session is expired.
     */
    public List<Map<String, Object>> getProblems(UUID connectionId, String hostId) {
        log.info("Fetching Zabbix problems for connection={}, hostId={}", connectionId, hostId);
        return callWithTokenRefresh(connectionId, (token) -> {
            String url = buildApiUrl(connectionId);
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("jsonrpc", "2.0");
            requestBody.put("method", "problem.get");

            Map<String, Object> params = new HashMap<>();
            if (hostId != null) {
                params.put("hostids", Collections.singletonList(hostId));
            }
            params.put("recent", true);
            params.put("output", Arrays.asList("eventid", "objectid", "clock", "name", "severity",
                    "acknowledged", "r_eventid", "r_clock"));
            requestBody.put("params", params);
            requestBody.put("id", 4);
            requestBody.put("auth", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            checkApiResponse(response, "problem.get");
            List<Map<String, Object>> result = (List<Map<String, Object>>) response.getBody().get("result");
            log.info("Zabbix problem.get returned {} problems for connection={}, hostId={}", result != null ? result.size() : 0, connectionId, hostId);
            return result != null ? result : Collections.emptyList();
        }, "problem.get", connectionId);
    }

    public void invalidateToken(UUID connectionId) {
        tokenCache.remove(connectionId);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Executes a Zabbix API call. On auth error (session expired), clears the cached
     * token, re-authenticates, and retries ONCE.
     */
    private <T> T callWithTokenRefresh(UUID connectionId, ZabbixApiCall<T> call, String method, UUID connId) {
        String token = authenticate(connectionId);
        try {
            return call.execute(token);
        } catch (ZabbixAuthExpiredException e) {
            log.warn("Zabbix token expired for connection {}, refreshing and retrying {}...", connectionId, method);
            String freshToken = authenticateFresh(connectionId);
            try {
                return call.execute(freshToken);
            } catch (Exception retryEx) {
                log.error("Zabbix {} failed after token refresh for connection {}: {}", method, connectionId, retryEx.getMessage());
                throw new RuntimeException("Zabbix " + method + " failed: " + retryEx.getMessage(), retryEx);
            }
        } catch (Exception e) {
            log.error("Zabbix {} failed for connection={}: {}", method, connectionId, e.getMessage());
            tokenCache.remove(connectionId);
            throw new RuntimeException("Zabbix " + method + " failed: " + e.getMessage(), e);
        }
    }

    private void checkApiResponse(ResponseEntity<Map> response, String method) {
        if (response.getBody() == null || response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Zabbix " + method + " returned non-200 or empty body");
        }
        Map body = response.getBody();
        if (body.containsKey("error")) {
            Map errorObj = (Map) body.get("error");
            String errMessage = errorObj != null ? String.valueOf(errorObj.get("data")) : "Unknown API error";
            String errCode = errorObj != null ? String.valueOf(errorObj.get("code")) : "";
            // Zabbix returns code -32602 or message "Not authorised." for expired sessions
            boolean isAuthError = errMessage != null &&
                    (errMessage.contains("Not authorised") || errMessage.contains("Not authorized")
                            || errMessage.contains("session") || "-32602".equals(errCode));
            if (isAuthError) {
                throw new ZabbixAuthExpiredException("Zabbix session expired: " + errMessage);
            }
            throw new RuntimeException("Zabbix " + method + " API error: " + errMessage);
        }
    }

    private String buildApiUrl(UUID connectionId) {
        ProviderConnection conn = connectionRepository.findByIdNative(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + connectionId));
        return buildApiUrl(conn);
    }

    private String buildApiUrl(ProviderConnection conn) {
        String url = conn.getBaseUrl() != null ? conn.getBaseUrl().trim() : "";
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        if (!url.endsWith("/api_jsonrpc.php")) {
            url = url + "/api_jsonrpc.php";
        }
        return url;
    }

    @FunctionalInterface
    private interface ZabbixApiCall<T> {
        T execute(String token) throws Exception;
    }

    private static class ZabbixAuthExpiredException extends RuntimeException {
        ZabbixAuthExpiredException(String msg) { super(msg); }
    }
}
