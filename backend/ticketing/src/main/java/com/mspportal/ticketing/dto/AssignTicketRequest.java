package com.mspportal.ticketing.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AssignTicketRequest {
    private String assigneeId;
}
