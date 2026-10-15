package com.mspportal.ticketing.repository;

import com.mspportal.ticketing.entity.SlaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, UUID>, JpaSpecificationExecutor<SlaPolicy> {
}
