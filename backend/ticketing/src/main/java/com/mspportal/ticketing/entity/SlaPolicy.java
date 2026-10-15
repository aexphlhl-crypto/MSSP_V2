package com.mspportal.ticketing.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sla_policies")
@Getter
@Setter
public class SlaPolicy extends BaseTenantEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "target_rpo_minutes", nullable = false)
    private Integer targetRpoMinutes;

    @Column(name = "target_rto_minutes", nullable = false)
    private Integer targetRtoMinutes;

    @Column(columnDefinition = "TEXT")
    private String description;
}
