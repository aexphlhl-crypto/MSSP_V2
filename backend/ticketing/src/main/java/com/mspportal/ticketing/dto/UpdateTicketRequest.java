package com.mspportal.ticketing.dto;

import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketImpact;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.enums.TicketType;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * PATCH-style partial update request for a ticket.
 * Only non-null fields will be applied; null means "don't change this field".
 * Status changes use PATCH /{id}/status endpoint.
 * Assignee changes use PATCH /{id}/assignee endpoint.
 */
@Data
public class UpdateTicketRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;
    private TicketPriority priority;
    private TicketCategory category;
    private TicketType type;
    private String subcategory;
    private TicketImpact impact;
    private String assignmentGroup;

    /**
     * Must belong to the authenticated tenant.
     * Validated against tenant context before persistence.
     */
    private UUID siteId;

    /**
     * Must belong to the authenticated tenant AND to the supplied siteId (if both non-null).
     */
    private UUID deviceId;

    /**
     * Must belong to the authenticated tenant.
     */
    private UUID relatedAlertId;

    /**
     * OperationalIncident is a POJO, not a JPA entity. No DB FK enforced.
     */
    private UUID relatedIncidentId;

    /**
     * Must belong to the authenticated tenant.
     */
    private UUID providerConnectionId;
}
