package com.mspportal.ticketing.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.ticketing.dto.SlaPolicyResponse;
import com.mspportal.ticketing.dto.SlaSummaryResponse;
import com.mspportal.ticketing.entity.SlaPolicy;
import com.mspportal.ticketing.entity.Ticket;
import com.mspportal.ticketing.repository.SlaPolicyRepository;
import com.mspportal.ticketing.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
public class SlaPolicyService {

    private final SlaPolicyRepository slaPolicyRepository;
    private final TicketRepository ticketRepository;

    public SlaPolicyService(SlaPolicyRepository slaPolicyRepository, TicketRepository ticketRepository) {
        this.slaPolicyRepository = slaPolicyRepository;
        this.ticketRepository = ticketRepository;
    }

    private boolean isPlatformUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN")
                        || a.getAuthority().equals("ROLE_PLATFORM_TECH"));
    }

    private <T> T withAuthorizedTenantSwitch(String requestedTenantId, java.util.function.Supplier<T> action) {
        if (requestedTenantId == null || requestedTenantId.isBlank()) {
            return action.get();
        }
        if (!isPlatformUser()) {
            return action.get();
        }
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(requestedTenantId);
            return action.get();
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    @Transactional(readOnly = true)
    public Page<SlaPolicyResponse> listPolicies(String requestedTenantId, Pageable pageable) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            return slaPolicyRepository.findAll(pageable).map(this::mapToResponse);
        });
    }

    @Transactional(readOnly = true)
    public SlaSummaryResponse getSummary(String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            long totalPolicies = slaPolicyRepository.count();
            
            long breaches = ticketRepository.count((root, query, cb) -> cb.or(
                    cb.isTrue(root.get("responseSlaBreached")),
                    cb.isTrue(root.get("resolutionSlaBreached"))
            ));

            List<Ticket> responded = ticketRepository.findAll((root, query, cb) -> cb.and(
                    cb.isNotNull(root.get("firstResponseAt")),
                    cb.isNotNull(root.get("createdAt"))
            ));

            Double avgResponse = null;
            if (!responded.isEmpty()) {
                double totalResponseSecs = responded.stream()
                        .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getFirstResponseAt()).toSeconds())
                        .sum();
                avgResponse = (totalResponseSecs / responded.size()) / 60.0;
            }

            List<Ticket> resolved = ticketRepository.findAll((root, query, cb) -> cb.and(
                    cb.isNotNull(root.get("resolvedAt")),
                    cb.isNotNull(root.get("createdAt"))
            ));

            Double avgResolution = null;
            if (!resolved.isEmpty()) {
                double totalResolutionSecs = resolved.stream()
                        .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getResolvedAt()).toSeconds())
                        .sum();
                avgResolution = (totalResolutionSecs / resolved.size()) / 60.0;
            }

            SlaSummaryResponse res = new SlaSummaryResponse();
            res.setTotalPolicies(totalPolicies);
            res.setActivePolicies(totalPolicies);
            res.setBreaches(breaches);
            res.setAverageResponseTimeMinutes(avgResponse);
            res.setAverageResolutionTimeMinutes(avgResolution);
            return res;
        });
    }

    @Transactional(readOnly = true)
    public SlaPolicyResponse getPolicy(UUID id, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            SlaPolicy policy = slaPolicyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("SLA Policy not found"));
            return mapToResponse(policy);
        });
    }

    private SlaPolicyResponse mapToResponse(SlaPolicy p) {
        SlaPolicyResponse res = new SlaPolicyResponse();
        res.setId(p.getId());
        res.setTenantId(p.getTenantId());
        res.setName(p.getName());
        res.setTargetRpoMinutes(p.getTargetRpoMinutes());
        res.setTargetRtoMinutes(p.getTargetRtoMinutes());
        res.setDescription(p.getDescription());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());
        return res;
    }
}
