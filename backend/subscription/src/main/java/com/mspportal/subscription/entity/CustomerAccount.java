package com.mspportal.subscription.entity;

import com.mspportal.common.entity.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "customer_accounts")
@Getter
@Setter
public class CustomerAccount extends BaseTenantEntity {

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(length = 50)
    private String status;
}
