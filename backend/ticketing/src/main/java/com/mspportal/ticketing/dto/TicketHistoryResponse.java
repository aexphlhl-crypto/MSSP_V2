package com.mspportal.ticketing.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class TicketHistoryResponse {
    private UUID id;
    private UUID ticketId;
    private String action;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String actorId;
    private Instant createdAt;
}
