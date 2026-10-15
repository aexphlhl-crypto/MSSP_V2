package com.mspportal.monitoring.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import com.mspportal.monitoring.enums.SiteStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sites")
public class Site extends BaseTenantEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private String identifier;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String address;

    @Column
    private String city;

    @Column
    private String country;

    @Column
    private String timezone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SiteStatus status;
}
