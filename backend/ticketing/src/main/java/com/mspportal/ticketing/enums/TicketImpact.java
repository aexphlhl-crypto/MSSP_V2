package com.mspportal.ticketing.enums;

/**
 * TicketImpact represents the scope of effect on the business.
 * Intentionally separate from TicketPriority.
 * Example: HIGH impact (many users affected) with MEDIUM priority (workaround exists).
 */
public enum TicketImpact {
    LOW,    // Minimal business disruption, single user or non-critical system
    MEDIUM, // Moderate disruption, multiple users or important system affected
    HIGH    // Significant disruption, large user group or critical system affected
}
