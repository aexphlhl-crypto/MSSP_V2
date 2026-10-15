package com.mspportal.integrationcore.action;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "action_approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "provider_action_id", nullable = false)
    private UUID providerActionId;

    @Column(name = "approver_id")
    private UUID approverId;

    @Column(nullable = false)
    private String status;

    @Column(name = "requested_at", insertable = false, updatable = false)
    private OffsetDateTime requestedAt;

    @Column(name = "acted_at")
    private OffsetDateTime actedAt;

    private String reason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
