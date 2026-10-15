package com.mspportal.security.repository;

import com.mspportal.security.entity.SecurityEvent;
import com.mspportal.security.enums.SecurityEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID>, JpaSpecificationExecutor<SecurityEvent> {
    List<SecurityEvent> findByStatus(SecurityEventStatus status);
}
