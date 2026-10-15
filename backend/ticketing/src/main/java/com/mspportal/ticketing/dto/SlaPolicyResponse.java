package com.mspportal.ticketing.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SlaPolicyResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private Integer targetRpoMinutes;
    private Integer targetRtoMinutes;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
