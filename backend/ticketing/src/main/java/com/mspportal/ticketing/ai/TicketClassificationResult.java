package com.mspportal.ticketing.ai;

import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketClassificationResult {
    private TicketCategory category;
    private TicketPriority priority;
    private Double confidence;
    private String reasoning;
}
