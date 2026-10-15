package com.mspportal.security.service;

import com.mspportal.security.dto.SecurityEventResponse;
import com.mspportal.security.entity.SecurityEvent;
import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventStatus;
import com.mspportal.security.repository.SecurityEndpointRepository;
import com.mspportal.security.repository.SecurityEventRepository;
import com.mspportal.security.entity.SecurityEndpoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SecurityEventService {

    private final SecurityEventRepository eventRepository;
    private final SecurityEndpointRepository endpointRepository;
    private final SecurityServiceHelper helper;

    public SecurityEventService(SecurityEventRepository eventRepository, SecurityEndpointRepository endpointRepository, SecurityServiceHelper helper) {
        this.eventRepository = eventRepository;
        this.endpointRepository = endpointRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public Page<SecurityEventResponse> listEvents(String requestedTenantId, Pageable pageable, 
                                                  SecurityEventSeverity severity, SecurityEventStatus status, 
                                                  String provider, String search) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            Specification<SecurityEvent> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                if (severity != null) {
                    predicates.add(cb.equal(root.get("severity"), severity));
                }
                if (status != null) {
                    predicates.add(cb.equal(root.get("status"), status));
                }
                if (provider != null && !provider.isBlank()) {
                    predicates.add(cb.equal(root.get("source"), provider));
                }
                if (search != null && !search.isBlank()) {
                    String pattern = "%" + search.toLowerCase() + "%";
                    predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                    ));
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };

            Page<SecurityEvent> page = eventRepository.findAll(spec, pageable);
            
            // Batch fetch endpoints
            List<UUID> endpointIds = page.getContent().stream()
                .map(SecurityEvent::getEndpointId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
                
            Map<UUID, SecurityEndpoint> endpointMap = endpointRepository.findByIdIn(endpointIds).stream()
                .collect(Collectors.toMap(SecurityEndpoint::getId, Function.identity()));
                
            return page.map(e -> {
                SecurityEventResponse res = mapToResponse(e);
                if (e.getEndpointId() != null) {
                    SecurityEndpoint ep = endpointMap.get(e.getEndpointId());
                    if (ep != null) {
                        res.setEndpointHostname(ep.getHostname());
                        res.setEndpointIpAddress(ep.getIpAddress());
                    }
                }
                return res;
            });
        });
    }

    @Transactional(readOnly = true)
    public SecurityEventResponse getEvent(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            SecurityEvent event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("SecurityEvent not found"));
            SecurityEventResponse res = mapToResponse(event);
            if (event.getEndpointId() != null) {
                endpointRepository.findById(event.getEndpointId()).ifPresent(ep -> {
                    res.setEndpointHostname(ep.getHostname());
                    res.setEndpointIpAddress(ep.getIpAddress());
                });
            }
            return res;
        });
    }

    @Transactional
    public SecurityEventResponse acknowledgeEvent(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot acknowledge security events");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            SecurityEvent event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("SecurityEvent not found"));
            
            if (event.getStatus() == SecurityEventStatus.OPEN) {
                event.setStatus(SecurityEventStatus.ACKNOWLEDGED);
                event = eventRepository.save(event);
            }
            return mapToResponse(event);
        });
    }

    @Transactional
    public SecurityEventResponse resolveEvent(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot resolve security events");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            SecurityEvent event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("SecurityEvent not found"));
            
            if (event.getStatus() == SecurityEventStatus.OPEN || event.getStatus() == SecurityEventStatus.ACKNOWLEDGED) {
                event.setStatus(SecurityEventStatus.RESOLVED);
                event.setResolvedAt(Instant.now());
                event = eventRepository.save(event);
            }
            return mapToResponse(event);
        });
    }

    private SecurityEventResponse mapToResponse(SecurityEvent e) {
        SecurityEventResponse r = new SecurityEventResponse();
        r.setId(e.getId());
        r.setTenantId(e.getTenantId());
        r.setEndpointId(e.getEndpointId());
        r.setType(e.getType());
        r.setSeverity(e.getSeverity());
        r.setStatus(e.getStatus());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setSource(e.getSource());
        r.setDetectedAt(e.getDetectedAt());
        r.setResolvedAt(e.getResolvedAt());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
