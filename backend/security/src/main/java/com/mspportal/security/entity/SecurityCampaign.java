package com.mspportal.security.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "security_campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SecurityCampaign extends BaseTenantEntity {

    @Column(name = "provider_connection_id")
    private UUID providerConnectionId;

    @Column(name = "provider_object_id")
    private String providerObjectId;

    @Column(name = "raw_data_reference", columnDefinition = "text")
    private String rawDataReference;
}
