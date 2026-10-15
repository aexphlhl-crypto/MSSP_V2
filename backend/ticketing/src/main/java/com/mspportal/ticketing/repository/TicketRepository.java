package com.mspportal.ticketing.repository;

import com.mspportal.ticketing.entity.Ticket;
import com.mspportal.ticketing.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID>, JpaSpecificationExecutor<Ticket> {

    @Query(value = "SELECT nextval('ticket_number_seq')", nativeQuery = true)
    Long getNextTicketSequence();

    long countByStatus(TicketStatus status);

    long countByTenantIdAndStatus(String tenantId, TicketStatus status);

    long countByTenantIdAndPriority(String tenantId, com.mspportal.ticketing.enums.TicketPriority priority);

    long countBySiteIdAndStatus(UUID siteId, TicketStatus status);

    /**
     * Explicit tenant-aware lookup.
     * Because BaseTenantEntity uses Hibernate @TenantId, the standard findById()
     * already filters by the active TenantContext. This variant is available for
     * cases where an explicit tenantId check is needed outside of a tenant session,
     * e.g. in tests or administrative queries.
     */
    Optional<Ticket> findByIdAndTenantId(UUID id, String tenantId);
}
