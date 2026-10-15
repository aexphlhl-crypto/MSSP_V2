package com.mspportal.security.repository;

import com.mspportal.security.entity.SecurityEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEndpointRepository extends JpaRepository<SecurityEndpoint, UUID>, JpaSpecificationExecutor<SecurityEndpoint> {
    List<SecurityEndpoint> findByIdIn(List<UUID> ids);
}
