package com.mspportal.ticketing.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryResponse {
    private long openTickets;
    private long inProgressTickets;
    private long pendingCustomerTickets;
    private long resolvedTickets;
    private long criticalTickets;
}
