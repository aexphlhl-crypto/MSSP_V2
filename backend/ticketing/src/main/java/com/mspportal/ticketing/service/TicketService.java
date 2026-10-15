package com.mspportal.ticketing.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.monitoring.repository.AlertRepository;
import com.mspportal.monitoring.repository.DeviceRepository;
import com.mspportal.monitoring.repository.SiteRepository;
import com.mspportal.integrationcore.repository.ProviderConnectionRepository;
import com.mspportal.ticketing.dto.*;
import com.mspportal.ticketing.entity.Ticket;
import com.mspportal.ticketing.entity.TicketComment;
import com.mspportal.ticketing.entity.TicketHistory;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.enums.TicketStatus;
import com.mspportal.ticketing.enums.TicketSource;
import com.mspportal.ticketing.enums.TicketType;
import com.mspportal.ticketing.enums.TicketImpact;
import com.mspportal.ticketing.repository.TicketCommentRepository;
import com.mspportal.ticketing.repository.TicketHistoryRepository;
import com.mspportal.ticketing.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final jakarta.persistence.EntityManager entityManager;
    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final ProviderConnectionRepository providerConnectionRepository;
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    public TicketService(
            TicketRepository ticketRepository,
            TicketCommentRepository ticketCommentRepository,
            TicketHistoryRepository ticketHistoryRepository,
            jakarta.persistence.EntityManager entityManager,
            SiteRepository siteRepository,
            DeviceRepository deviceRepository,
            AlertRepository alertRepository,
            ProviderConnectionRepository providerConnectionRepository,
            org.springframework.transaction.PlatformTransactionManager transactionManager) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.entityManager = entityManager;
        this.siteRepository = siteRepository;
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
        this.providerConnectionRepository = providerConnectionRepository;
        this.transactionTemplate = new org.springframework.transaction.support.TransactionTemplate(transactionManager);
    }

    // =========================================================================
    // Authentication/Tenant helpers
    // =========================================================================

    private boolean isPlatformUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN")
                        || a.getAuthority().equals("ROLE_PLATFORM_TECH"));
    }

    private boolean isPlatformAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN"));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }

    /**
     * Platform Admins may supply a tenantId to operate on another tenant's data.
     * Non-platform users cannot override their JWT-derived tenant context.
     * This is an explicit authorized tenant-switch with audit logging.
     */
    private <T> T withAuthorizedTenantSwitch(String requestedTenantId, java.util.function.Supplier<T> action) {
        if (requestedTenantId == null || requestedTenantId.isBlank()) {
            return transactionTemplate.execute(status -> action.get());
        }
        if (!isPlatformUser()) {
            // Non-platform users: silently ignore the requested tenant, use JWT tenant
            return transactionTemplate.execute(status -> action.get());
        }
        // Platform user doing authorized cross-tenant operation — log it
        String originalTenant = TenantContext.getCurrentTenant();
        String actor = getCurrentUserId();
        try {
            TenantContext.setCurrentTenant(requestedTenantId);
            return transactionTemplate.execute(status -> {
                T result = action.get();
                // Audit log: platform admin accessed another tenant
                if (!requestedTenantId.equals(originalTenant)) {
                    recordPlatformAdminAudit(actor, originalTenant, requestedTenantId);
                }
                entityManager.flush();
                return result;
            });
        } finally {
            TenantContext.setCurrentTenant(originalTenant);
        }
    }

    private void recordPlatformAdminAudit(String actor, String fromTenant, String toTenant) {
        // Record the cross-tenant switch in ticket_history for audit purposes.
        // This entry has no ticket_id (null is allowed by the schema) and serves as a system audit event.
        // Production systems would write to a dedicated audit_log table.
        // For now, we log to stderr for observability.
        System.err.printf("[AUDIT] Platform user '%s' switched tenant context from '%s' to '%s' at %s%n",
                actor, fromTenant, toTenant, Instant.now());
    }

    // =========================================================================
    // Cross-tenant resource validation
    // =========================================================================

    /**
     * Validates that a site belongs to the CURRENT tenant context.
     * Since SiteRepository's entity extends BaseTenantEntity with @TenantId,
     * Hibernate automatically filters by the active TenantContext.
     * If findById returns empty, the site either doesn't exist or belongs to a different tenant.
     * Both cases are treated as 403 to prevent tenant enumeration.
     */
    private void validateSiteOwnership(UUID siteId) {
        if (siteId == null) return;
        siteRepository.findByIdAndTenantId(siteId, TenantContext.getCurrentTenant()).orElseThrow(() -> new AccessDeniedException("Site not found or does not belong to the authenticated tenant"));
    }

    /**
     * Validates that a device belongs to the CURRENT tenant context.
     * If siteId is also provided, additionally validates device.siteId matches.
     */
    private void validateDeviceOwnership(UUID deviceId, UUID siteId) {
        if (deviceId == null) return;
        var device = deviceRepository.findByIdAndTenantId(deviceId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new RuntimeException(
                        "Device not found or does not belong to the authenticated tenant"));
        // Additional check: device must belong to the specified site when both are provided
        if (siteId != null && device.getSiteId() != null && !device.getSiteId().equals(siteId)) {
            throw new AccessDeniedException(
                    "Device does not belong to the specified site");
        }
    }

    /**
     * Validates that an alert belongs to the CURRENT tenant context.
     */
    private void validateAlertOwnership(UUID alertId) {
        if (alertId == null) return;
        alertRepository.findByIdAndTenantId(alertId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new RuntimeException(
                        "Alert not found or does not belong to the authenticated tenant"));
    }

    /**
     * Validates that a provider connection belongs to the CURRENT tenant context.
     */
    private void validateProviderConnectionOwnership(UUID providerConnectionId) {
        if (providerConnectionId == null) return;
        providerConnectionRepository.findByIdAndTenantId(providerConnectionId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new RuntimeException(
                        "Provider connection not found or does not belong to the authenticated tenant"));
    }

    /**
     * Runs all cross-tenant resource validations for a ticket creation or update.
     */
    private void validateLinkedResources(UUID siteId, UUID deviceId, UUID alertId, UUID providerConnectionId) {
        validateSiteOwnership(siteId);
        validateDeviceOwnership(deviceId, siteId);
        validateAlertOwnership(alertId);
        validateProviderConnectionOwnership(providerConnectionId);
    }

    // =========================================================================
    // CRUD operations
    // =========================================================================

    public TicketResponse createTicket(CreateTicketRequest request, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            // Validate cross-tenant resource ownership BEFORE creating the ticket
            validateLinkedResources(
                    request.getSiteId(),
                    request.getDeviceId(),
                    request.getRelatedAlertId(),
                    request.getProviderConnectionId());

            Ticket ticket = new Ticket();
            ticket.setTenantId(TenantContext.getCurrentTenant());
            ticket.setTicketNumber("INC-" + String.format("%06d", ticketRepository.getNextTicketSequence()));
            ticket.setTitle(request.getTitle());
            ticket.setDescription(request.getDescription());
            ticket.setPriority(request.getPriority());
            ticket.setCategory(request.getCategory());
            ticket.setStatus(TicketStatus.OPEN);
            ticket.setSource(TicketSource.PORTAL);
            ticket.setRequesterId(getCurrentUserId());

            // Phase 15 optional fields
            ticket.setType(request.getType());
            ticket.setSubcategory(request.getSubcategory());
            ticket.setImpact(request.getImpact());
            ticket.setAssignmentGroup(request.getAssignmentGroup());
            ticket.setSiteId(request.getSiteId());
            ticket.setDeviceId(request.getDeviceId());
            ticket.setRelatedAlertId(request.getRelatedAlertId());
            ticket.setRelatedIncidentId(request.getRelatedIncidentId());
            ticket.setProviderConnectionId(request.getProviderConnectionId());

            Ticket saved = ticketRepository.save(ticket);
            recordHistory(saved.getId(), "TICKET_CREATED", null, null, null);

            return mapToResponse(saved);
        });
    }

    public Page<TicketResponse> listTickets(Pageable pageable, String requestedTenantId, UUID siteId, UUID deviceId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            org.springframework.data.jpa.domain.Specification<Ticket> spec = (root, query, cb) -> cb.conjunction();

            if (siteId != null) {
                spec = spec.and((root, query, cb) -> cb.equal(root.get("siteId"), siteId));
            }
            if (deviceId != null) {
                spec = spec.and((root, query, cb) -> cb.equal(root.get("deviceId"), deviceId));
            }
            return ticketRepository.findAll(spec, pageable).map(this::mapToResponse);
        });
    }

    public TicketResponse getTicket(UUID id, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            // findById uses Hibernate @TenantId filter — cross-tenant tickets return empty
            Ticket ticket = ticketRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));
            return mapToResponse(ticket);
        });
    }

    /**
     * PATCH-style partial update. Only non-null fields in the request are applied.
     * Dedicated endpoints handle status and assignee changes.
     */
    public TicketResponse patchTicket(UUID id, UpdateTicketRequest request, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            Ticket ticket = ticketRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            // Validate linked resources that are being changed
            UUID newSiteId = request.getSiteId() != null ? request.getSiteId() : ticket.getSiteId();
            UUID newDeviceId = request.getDeviceId() != null ? request.getDeviceId() : ticket.getDeviceId();
            // Only validate changed references to avoid unnecessary DB hits
            if (request.getSiteId() != null) validateSiteOwnership(request.getSiteId());
            if (request.getDeviceId() != null) validateDeviceOwnership(request.getDeviceId(), newSiteId);
            if (request.getRelatedAlertId() != null) validateAlertOwnership(request.getRelatedAlertId());
            if (request.getProviderConnectionId() != null) validateProviderConnectionOwnership(request.getProviderConnectionId());

            // Apply non-null fields and track history
            if (request.getTitle() != null && !request.getTitle().equals(ticket.getTitle())) {
                recordHistory(id, "FIELD_CHANGED", "title", ticket.getTitle(), request.getTitle());
                ticket.setTitle(request.getTitle());
            }
            if (request.getDescription() != null && !request.getDescription().equals(ticket.getDescription())) {
                recordHistory(id, "FIELD_CHANGED", "description", truncate(ticket.getDescription()), truncate(request.getDescription()));
                ticket.setDescription(request.getDescription());
            }
            if (request.getPriority() != null && request.getPriority() != ticket.getPriority()) {
                recordHistory(id, "PRIORITY_CHANGED", "priority",
                        ticket.getPriority().name(), request.getPriority().name());
                ticket.setPriority(request.getPriority());
            }
            if (request.getCategory() != null && request.getCategory() != ticket.getCategory()) {
                recordHistory(id, "CATEGORY_CHANGED", "category",
                        ticket.getCategory().name(), request.getCategory().name());
                ticket.setCategory(request.getCategory());
            }
            if (request.getType() != null && request.getType() != ticket.getType()) {
                recordHistory(id, "TYPE_CHANGED", "type",
                        ticket.getType() != null ? ticket.getType().name() : null,
                        request.getType().name());
                ticket.setType(request.getType());
            }
            if (request.getImpact() != null && request.getImpact() != ticket.getImpact()) {
                recordHistory(id, "IMPACT_CHANGED", "impact",
                        ticket.getImpact() != null ? ticket.getImpact().name() : null,
                        request.getImpact().name());
                ticket.setImpact(request.getImpact());
            }
            if (request.getAssignmentGroup() != null && !request.getAssignmentGroup().equals(ticket.getAssignmentGroup())) {
                recordHistory(id, "ASSIGNMENT_GROUP_CHANGED", "assignmentGroup",
                        ticket.getAssignmentGroup(), request.getAssignmentGroup());
                ticket.setAssignmentGroup(request.getAssignmentGroup());
            }
            if (request.getSubcategory() != null && !request.getSubcategory().equals(ticket.getSubcategory())) {
                recordHistory(id, "FIELD_CHANGED", "subcategory",
                        ticket.getSubcategory(), request.getSubcategory());
                ticket.setSubcategory(request.getSubcategory());
            }
            if (request.getSiteId() != null && !request.getSiteId().equals(ticket.getSiteId())) {
                recordHistory(id, "SITE_CHANGED", "siteId",
                        ticket.getSiteId() != null ? ticket.getSiteId().toString() : null,
                        request.getSiteId().toString());
                ticket.setSiteId(request.getSiteId());
            }
            if (request.getDeviceId() != null && !request.getDeviceId().equals(ticket.getDeviceId())) {
                recordHistory(id, "DEVICE_CHANGED", "deviceId",
                        ticket.getDeviceId() != null ? ticket.getDeviceId().toString() : null,
                        request.getDeviceId().toString());
                ticket.setDeviceId(request.getDeviceId());
            }
            if (request.getRelatedAlertId() != null && !request.getRelatedAlertId().equals(ticket.getRelatedAlertId())) {
                recordHistory(id, "ALERT_LINKED", "relatedAlertId",
                        ticket.getRelatedAlertId() != null ? ticket.getRelatedAlertId().toString() : null,
                        request.getRelatedAlertId().toString());
                ticket.setRelatedAlertId(request.getRelatedAlertId());
            }
            if (request.getRelatedIncidentId() != null && !request.getRelatedIncidentId().equals(ticket.getRelatedIncidentId())) {
                recordHistory(id, "INCIDENT_LINKED", "relatedIncidentId",
                        ticket.getRelatedIncidentId() != null ? ticket.getRelatedIncidentId().toString() : null,
                        request.getRelatedIncidentId().toString());
                ticket.setRelatedIncidentId(request.getRelatedIncidentId());
            }
            if (request.getProviderConnectionId() != null && !request.getProviderConnectionId().equals(ticket.getProviderConnectionId())) {
                recordHistory(id, "PROVIDER_LINKED", "providerConnectionId",
                        ticket.getProviderConnectionId() != null ? ticket.getProviderConnectionId().toString() : null,
                        request.getProviderConnectionId().toString());
                ticket.setProviderConnectionId(request.getProviderConnectionId());
            }

            return mapToResponse(ticketRepository.save(ticket));
        });
    }

    public TicketResponse updateTicketStatus(UUID id, UpdateTicketStatusRequest request, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            Ticket ticket = ticketRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            if (request.getStatus() == ticket.getStatus()) {
                return mapToResponse(ticket); // No change — no history entry
            }

            String oldStatus = ticket.getStatus().name();
            ticket.setStatus(request.getStatus());

            if (request.getStatus() == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(Instant.now());
            } else if (request.getStatus() == TicketStatus.CLOSED && ticket.getClosedAt() == null) {
                ticket.setClosedAt(Instant.now());
            }

            Ticket saved = ticketRepository.save(ticket);
            recordHistory(saved.getId(), "STATUS_CHANGED", "status", oldStatus, request.getStatus().name());

            return mapToResponse(saved);
        });
    }

    public TicketResponse assignTicket(UUID id, AssignTicketRequest request, String requestedTenantId) {
        if (!isPlatformUser()) {
            throw new AccessDeniedException("Only MSP staff can assign tickets");
        }

        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            Ticket ticket = ticketRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            String oldAssignee = ticket.getAssigneeId();
            String newAssignee = request.getAssigneeId();

            if (java.util.Objects.equals(oldAssignee, newAssignee)) {
                return mapToResponse(ticket); // No change
            }

            ticket.setAssigneeId(newAssignee);
            Ticket saved = ticketRepository.save(ticket);
            recordHistory(saved.getId(), "ASSIGNED", "assigneeId", oldAssignee, newAssignee);

            return mapToResponse(saved);
        });
    }

    public CommentResponse addComment(UUID id, AddCommentRequest request, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            Ticket ticket = ticketRepository.findById(id)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            // Internal notes can only be created by platform users; customers' internal flag is silently ignored
            boolean internal = request.isInternal() && isPlatformUser();

            TicketComment comment = new TicketComment();
            comment.setTenantId(TenantContext.getCurrentTenant());
            comment.setTicketId(ticket.getId());
            comment.setAuthorId(getCurrentUserId());
            comment.setContent(request.getContent());
            comment.setInternal(internal);

            TicketComment saved = ticketCommentRepository.save(comment);
            recordHistory(ticket.getId(), internal ? "INTERNAL_NOTE_ADDED" : "PUBLIC_COMMENT_ADDED",
                    null, null, null);

            // Record first response time when an MSP staff member posts a public reply
            if (isPlatformUser() && !internal && ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(Instant.now());
                ticketRepository.save(ticket);
            }

            return mapCommentResponse(saved);
        });
    }

    public List<CommentResponse> getComments(UUID ticketId, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            // Verify ticket exists and belongs to the authenticated tenant
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            List<TicketComment> comments;
            if (isPlatformUser()) {
                // MSP staff see both public and internal comments
                comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
            } else {
                // Customers only see public comments — internal=false enforced at service layer
                comments = ticketCommentRepository.findByTicketIdAndInternalFalseOrderByCreatedAtAsc(ticketId);
            }

            return comments.stream().map(this::mapCommentResponse).collect(Collectors.toList());
        });
    }

    public List<TicketHistoryResponse> getHistory(UUID ticketId, String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ticket not found"));

            return ticketHistoryRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                    .stream()
                    .map(h -> {
                        TicketHistoryResponse r = new TicketHistoryResponse();
                        r.setId(h.getId());
                        r.setTicketId(h.getTicketId());
                        r.setAction(h.getAction());
                        r.setFieldName(h.getFieldName());
                        r.setOldValue(h.getOldValue());
                        r.setNewValue(h.getNewValue());
                        r.setActorId(h.getActorId());
                        r.setCreatedAt(h.getCreatedAt());
                        return r;
                    })
                    .collect(Collectors.toList());
        });
    }

    public TicketSummaryResponse getSummary(String requestedTenantId) {
        return withAuthorizedTenantSwitch(requestedTenantId, () -> {
            String tenantId = TenantContext.getCurrentTenant();
            long open = ticketRepository.countByTenantIdAndStatus(tenantId, TicketStatus.OPEN);
            long inProg = ticketRepository.countByTenantIdAndStatus(tenantId, TicketStatus.IN_PROGRESS);
            long pendingCust = ticketRepository.countByTenantIdAndStatus(tenantId, TicketStatus.PENDING_CUSTOMER);
            long resolved = ticketRepository.countByTenantIdAndStatus(tenantId, TicketStatus.RESOLVED);
            long critical = ticketRepository.countByTenantIdAndPriority(tenantId, TicketPriority.CRITICAL);

            return new TicketSummaryResponse(open, inProg, pendingCust, resolved, critical);
        });
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private void recordHistory(UUID ticketId, String action, String fieldName, String oldValue, String newValue) {
        TicketHistory history = new TicketHistory();
        history.setTenantId(TenantContext.getCurrentTenant());
        history.setTicketId(ticketId);
        history.setAction(action);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setActorId(getCurrentUserId());
        ticketHistoryRepository.save(history);
    }

    private String truncate(String value) {
        if (value == null) return null;
        return value.length() > 100 ? value.substring(0, 100) + "..." : value;
    }

    private TicketResponse mapToResponse(Ticket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId());
        r.setTenantId(t.getTenantId() != null ? t.getTenantId() : TenantContext.getCurrentTenant());
        r.setTicketNumber(t.getTicketNumber());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setStatus(t.getStatus());
        r.setPriority(t.getPriority());
        r.setCategory(t.getCategory());
        r.setSource(t.getSource());
        r.setType(t.getType());
        r.setSubcategory(t.getSubcategory());
        r.setImpact(t.getImpact());
        r.setAssignmentGroup(t.getAssignmentGroup());
        r.setRequesterId(t.getRequesterId());
        r.setAssigneeId(t.getAssigneeId());
        r.setSiteId(t.getSiteId());
        r.setDeviceId(t.getDeviceId());
        r.setRelatedIncidentId(t.getRelatedIncidentId());
        r.setRelatedAlertId(t.getRelatedAlertId());
        r.setProviderConnectionId(t.getProviderConnectionId());
        r.setResponseDueAt(t.getResponseDueAt());
        r.setResolutionDueAt(t.getResolutionDueAt());
        r.setResponseSlaBreached(t.isResponseSlaBreached());
        r.setResolutionSlaBreached(t.isResolutionSlaBreached());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        r.setCreatedBy(t.getCreatedBy());
        r.setFirstResponseAt(t.getFirstResponseAt());
        r.setResolvedAt(t.getResolvedAt());
        r.setClosedAt(t.getClosedAt());
        return r;
    }

    private CommentResponse mapCommentResponse(TicketComment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setTicketId(c.getTicketId());
        r.setAuthorId(c.getAuthorId());
        r.setContent(c.getContent());
        r.setInternal(c.isInternal());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}









