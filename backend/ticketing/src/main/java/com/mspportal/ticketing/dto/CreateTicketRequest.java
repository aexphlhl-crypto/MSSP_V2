package com.mspportal.ticketing.dto;

import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketImpact;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.enums.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    // Optional Phase 15 fields
    private TicketType type;
    private String subcategory;
    private TicketImpact impact;
    private String assignmentGroup;

    /**
     * Must belong to the authenticated tenant.
     * Validated by TicketService before persistence.
     */
    private UUID siteId;

    /**
     * Must belong to the authenticated tenant AND to the supplied siteId (if both provided).
     * Validated by TicketService before persistence.
     */
    private UUID deviceId;

    /**
     * Must belong to the authenticated tenant.
     * Validated by TicketService before persistence.
     * FK exists in DB: alerts(id) ON DELETE SET NULL.
     */
    private UUID relatedAlertId;

    /**
     * OperationalIncident is a POJO, not a JPA entity.
     * No FK enforced at DB level; stored as-is for informational linkage only.
     */
    private UUID relatedIncidentId;

    /**
     * Must belong to the authenticated tenant.
     * Validated by TicketService before persistence.
     * FK exists in DB: provider_connections(id) ON DELETE SET NULL.
     */
    private UUID providerConnectionId;
}
