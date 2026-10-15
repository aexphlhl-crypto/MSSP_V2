package com.mspportal.ticketing.dto;

import com.mspportal.ticketing.enums.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    private TicketStatus status;
}
