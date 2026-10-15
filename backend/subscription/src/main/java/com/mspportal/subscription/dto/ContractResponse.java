package com.mspportal.subscription.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ContractResponse {
    private UUID id;
    private UUID customerAccountId;
    private String accountName;
    private String tenantId;
    private String status;
    private Instant startDate;
    private Instant endDate;
    private Instant createdAt;
    private Instant updatedAt;
}
