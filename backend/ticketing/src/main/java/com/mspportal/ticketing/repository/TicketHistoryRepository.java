package com.mspportal.ticketing.repository;

import com.mspportal.ticketing.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, UUID> {
    
    List<TicketHistory> findByTicketIdOrderByCreatedAtDesc(UUID ticketId);
}
