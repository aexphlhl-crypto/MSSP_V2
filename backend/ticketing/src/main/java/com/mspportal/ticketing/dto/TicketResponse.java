package com.mspportal.ticketing.dto;

import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketImpact;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.enums.TicketSource;
import com.mspportal.ticketing.enums.TicketStatus;
import com.mspportal.ticketing.enums.TicketType;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TicketResponse {
    private UUID id;
    private String tenantId;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private TicketSource source;

    // Phase 15 additions
    private TicketType type;
    private String subcategory;
    private TicketImpact impact;
    private String assignmentGroup;

    // Contextual references
    private String requesterId;
    private String assigneeId;
    private UUID siteId;
    private UUID deviceId;
    private UUID relatedIncidentId;
    private UUID relatedAlertId;
    private UUID providerConnectionId;

    // SLA fields — populated when SLA engine is available; null = NOT_AVAILABLE
    private Instant responseDueAt;
    private Instant resolutionDueAt;
    private Boolean responseSlaBreached;
    private Boolean resolutionSlaBreached;

    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private Instant firstResponseAt;
    private Instant resolvedAt;
    private Instant closedAt;
}
