package com.mspportal.ticketing.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketImpact;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.enums.TicketSource;
import com.mspportal.ticketing.enums.TicketStatus;
import com.mspportal.ticketing.enums.TicketType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "tickets")
public class Ticket extends BaseTenantEntity {

    @Column(name = "ticket_number", nullable = false, updatable = false)
    private String ticketNumber;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketSource source;

    // Phase 15 additions
    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type")
    private TicketType type;

    @Column(name = "subcategory")
    private String subcategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact")
    private TicketImpact impact;

    /**
     * Assignment group - stored as a free-text name/identifier.
     * No AssignmentGroup entity exists in this architecture.
     */
    @Column(name = "assignment_group")
    private String assignmentGroup;


    @Column(name = "requester_id")
    private String requesterId;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "site_id")
    private UUID siteId;

    @Column(name = "device_id")
    private UUID deviceId;

    /**
     * Related OperationalIncident ID.
     * NOTE: OperationalIncident is not a JPA entity (no DB table).
     * No FK constraint is enforced at DB level; validated at service layer.
     */
    @Column(name = "related_incident_id")
    private UUID relatedIncidentId;

    /**
     * Related Alert ID.
     * FK to alerts(id) ON DELETE SET NULL in the DB migration.
     * Validated to belong to the authenticated tenant before persistence.
     */
    @Column(name = "related_alert_id")
    private UUID relatedAlertId;

    /**
     * Related ProviderConnection ID.
     * FK to provider_connections(id) ON DELETE SET NULL in the DB migration.
     * Validated to belong to the authenticated tenant before persistence.
     */
    @Column(name = "provider_connection_id")
    private UUID providerConnectionId;

    // SLA tracking fields (populated externally when SLA engine is available)
    @Column(name = "first_response_at")
    private Instant firstResponseAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "response_due_at")
    private Instant responseDueAt;

    @Column(name = "resolution_due_at")
    private Instant resolutionDueAt;

    @Column(name = "response_sla_breached")
    private boolean responseSlaBreached = false;

    @Column(name = "resolution_sla_breached")
    private boolean resolutionSlaBreached = false;
}
