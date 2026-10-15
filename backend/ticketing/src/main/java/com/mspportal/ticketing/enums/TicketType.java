package com.mspportal.ticketing.enums;

/**
 * Ticket Type distinguishes the nature of the work required.
 * Separate from category (which identifies the affected technology area).
 */
public enum TicketType {
    INCIDENT,        // Unplanned service disruption or quality reduction
    SERVICE_REQUEST, // Formal request for a standard change or information
    QUESTION,        // Information request not requiring a change
    PROBLEM,         // Root cause investigation of one or more incidents
    CHANGE           // Planned modification to the IT environment
}
