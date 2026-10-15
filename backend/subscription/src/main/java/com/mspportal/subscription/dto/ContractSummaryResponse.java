package com.mspportal.subscription.dto;

import lombok.Data;

@Data
public class ContractSummaryResponse {
    private long totalContracts;
    private long activeContracts;
    private long expiringSoonContracts;
    private long expiredContracts;
}
