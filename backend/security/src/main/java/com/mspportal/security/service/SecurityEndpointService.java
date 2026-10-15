package com.mspportal.security.service;

import com.mspportal.security.dto.SecurityEndpointResponse;
import com.mspportal.security.entity.SecurityEndpoint;
import com.mspportal.security.repository.SecurityEndpointRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import com.mspportal.security.enums.EndpointProtectionStatus;

@Service
public class SecurityEndpointService {

    private final SecurityEndpointRepository endpointRepository;
    private final SecurityServiceHelper helper;

    public SecurityEndpointService(SecurityEndpointRepository endpointRepository, SecurityServiceHelper helper) {
        this.endpointRepository = endpointRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public Page<SecurityEndpointResponse> listEndpoints(String requestedTenantId, Pageable pageable,
                                                        EndpointProtectionStatus protectionStatus, String search) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Specification<SecurityEndpoint> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                if (protectionStatus != null) {
                    predicates.add(cb.equal(root.get("protectionStatus"), protectionStatus));
                }
                if (search != null && !search.isBlank()) {
                    String pattern = "%" + search.toLowerCase() + "%";
                    predicates.add(cb.or(
                        cb.like(cb.lower(root.get("hostname")), pattern),
                        cb.like(cb.lower(root.get("ipAddress")), pattern),
                        cb.like(cb.lower(root.get("agentVersion")), pattern)
                    ));
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };

            return endpointRepository.findAll(spec, pageable).map(this::mapToResponse);
        });
    }

    @Transactional(readOnly = true)
    public SecurityEndpointResponse getEndpoint(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            SecurityEndpoint endpoint = endpointRepository.findById(id).orElseThrow(() -> new RuntimeException("SecurityEndpoint not found"));
            return mapToResponse(endpoint);
        });
    }

    private SecurityEndpointResponse mapToResponse(SecurityEndpoint e) {
        SecurityEndpointResponse r = new SecurityEndpointResponse();
        r.setId(e.getId());
        r.setTenantId(e.getTenantId());
        r.setDeviceId(e.getDeviceId());
        r.setHostname(e.getHostname());
        r.setIpAddress(e.getIpAddress());
        r.setProtectionStatus(e.getProtectionStatus());
        r.setAgentVersion(e.getAgentVersion());
        r.setLastCheckAt(e.getLastCheckAt());
        r.setRiskScore(e.getRiskScore());
        r.setIsolationSupported(e.isIsolationSupported());
        return r;
    }
}
