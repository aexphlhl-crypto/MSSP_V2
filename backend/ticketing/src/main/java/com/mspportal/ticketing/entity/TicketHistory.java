package com.mspportal.ticketing.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ticket_history")
public class TicketHistory extends BaseTenantEntity {

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(nullable = false)
    private String action;

    @Column(name = "field_name")
    private String fieldName;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "actor_id", nullable = false)
    private String actorId;
}
