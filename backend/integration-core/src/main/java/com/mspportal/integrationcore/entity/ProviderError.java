package com.mspportal.integrationcore.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "provider_errors")
public class ProviderError {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "sync_run_id")
    private UUID syncRunId;

    @Column(name = "provider_connection_id")
    private UUID providerConnectionId;

    @Column(name = "error_type")
    private String errorType; // e.g. TIMEOUT, RATE_LIMIT, AUTH_FAILURE

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "occurred_at")
    private Instant occurredAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSyncRunId() { return syncRunId; }
    public void setSyncRunId(UUID syncRunId) { this.syncRunId = syncRunId; }
    public UUID getProviderConnectionId() { return providerConnectionId; }
    public void setProviderConnectionId(UUID providerConnectionId) { this.providerConnectionId = providerConnectionId; }
    public String getErrorType() { return errorType; }
    public void setErrorType(String errorType) { this.errorType = errorType; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }
}
