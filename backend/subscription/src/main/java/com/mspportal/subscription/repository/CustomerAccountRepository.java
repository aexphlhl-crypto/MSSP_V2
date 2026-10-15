package com.mspportal.subscription.repository;

import com.mspportal.subscription.entity.CustomerAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerAccountRepository extends JpaRepository<CustomerAccount, UUID>, JpaSpecificationExecutor<CustomerAccount> {
    Optional<CustomerAccount> findByTenantId(String tenantId);
}
