package com.mspportal.subscription.entity;

import com.mspportal.common.entity.BaseEntity;
import com.mspportal.integrationcore.enums.ProviderCapability;
import com.mspportal.integrationcore.enums.ProviderType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "plan_provider_entitlements")
@Getter
@Setter
public class PlanProviderEntitlement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(name = "provider_type", nullable = false)
    private String providerName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_provider_capabilities", joinColumns = @JoinColumn(name = "plan_provider_entitlement_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "capability")
    private Set<ProviderCapability> capabilities = new HashSet<>();
}
