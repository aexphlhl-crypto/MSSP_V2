package com.mspportal.integrationcore.action;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "provider_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderAction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "target_entity_id", nullable = false)
    private String targetEntityId;

    @Column(nullable = false)
    private String status;

    @Column(name = "initiated_by", nullable = false)
    private UUID initiatedBy;

    @Column(name = "initiated_at", insertable = false, updatable = false)
    private OffsetDateTime initiatedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "result_details")
    private String resultDetails;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
