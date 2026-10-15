package com.mspportal.backup.provider;

import com.mspportal.integrationcore.credential.ProviderCredentialManager;
import com.mspportal.integrationcore.entity.ProviderConnection;
import com.mspportal.integrationcore.entity.ProviderCredential;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CommvaultClient {

    private static final Logger log = LoggerFactory.getLogger(CommvaultClient.class);
    
    private final ProviderCredentialManager credentialManager;
    private final ProviderConnectionRepository connectionRepository;
    private final RestTemplate restTemplate;
    
    // In-memory token cache to support reusable authenticated sessions
    private final Map<UUID, String> tokenCache = new ConcurrentHashMap<>();

    public CommvaultClient(ProviderCredentialManager credentialManager,
                           ProviderConnectionRepository connectionRepository) {
        this.credentialManager = credentialManager;
        this.connectionRepository = connectionRepository;
        
        // Setup RestTemplate with reasonable timeouts (e.g. 10s connect, 15s read)
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String getOrAuthenticateToken(UUID connectionId) {
        // Check cache first
        if (tokenCache.containsKey(connectionId)) {
            return tokenCache.get(connectionId);
        }
        
        // Fetch connection details
        ProviderConnection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + connectionId));
                
        // Fetch credentials
        ProviderCredential cred = credentialManager.getCredential(connectionId)
                .orElseThrow(() -> new IllegalStateException("Credentials not found for connection: " + connectionId));
                
        String secret = cred.getSecretValue();
        String username = "";
        String password = "";
        
        if (secret.trim().startsWith("{")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, String> credMap = mapper.readValue(secret, Map.class);
                username = credMap.get("username");
                password = credMap.get("password");
            } catch (Exception e) {
                log.error("Failed to parse JSON credentials: {}", e.getMessage());
            }
        }
        
        if (username == null || username.isEmpty()) {
            if (secret.contains(":")) {
                String[] parts = secret.split(":", 2);
                username = parts[0];
                password = parts[1];
            } else {
                username = "admin"; // fallback default
                password = secret;
            }
        }
        
        // Encode password to Base64 (Commvault requirement)
        String base64Password = Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
        
        String url = conn.getBaseUrl();
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        String loginUrl = url + "/Login";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
        
        Map<String, String> body = Map.of(
            "username", username,
            "password", base64Password
        );
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        
        try {
            log.info("Attempting Commvault login for connection: {} at URL: {}", connectionId, loginUrl);
            ResponseEntity<Map> response = restTemplate.postForEntity(loginUrl, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String token = (String) response.getBody().get("token");
                if (token != null && !token.isEmpty()) {
                    tokenCache.put(connectionId, token);
                    return token;
                }
            }
            throw new RuntimeException("Commvault login returned empty token");
        } catch (Exception e) {
            log.error("Commvault login failed for connection: {}. Error: {}", connectionId, e.getMessage());
            throw new RuntimeException("Commvault login failed: " + e.getMessage(), e);
        }
    }

    public void invalidateToken(UUID connectionId) {
        tokenCache.remove(connectionId);
    }
}
