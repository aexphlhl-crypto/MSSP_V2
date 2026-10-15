package com.mspportal.auth.entity;

import com.mspportal.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // e.g. "ROLE_ADMIN", "ROLE_TECH"

    @Column(name = "tenant_identifier", nullable = false)
    private String tenantIdentifier; // Links to Tenant.tenantIdentifier

    @Column
    private String name;

    @Column
    private String status;
}
