package com.mspportal.ticketing.controller;

import com.mspportal.ticketing.dto.*;
import com.mspportal.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@PreAuthorize("@entitlement.has('TICKETING')")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * Create a new ticket.
     * tenantId from @RequestParam is only honored by Platform Admin/Tech roles.
     * Regular users always create tickets within their JWT-derived tenant.
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.createTicket(request, tenantId));
    }

    @GetMapping
    public ResponseEntity<Page<TicketResponse>> listTickets(
            Pageable pageable,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) UUID siteId,
            @RequestParam(required = false) UUID deviceId) {
        return ResponseEntity.ok(ticketService.listTickets(pageable, tenantId, siteId, deviceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable UUID id,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.getTicket(id, tenantId));
    }

    /**
     * PATCH partial update for ticket fields.
     * Only non-null fields in the request body are applied.
     * Status changes: use PATCH /{id}/status
     * Assignee changes: use PATCH /{id}/assignee
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> patchTicket(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.patchTicket(id, request, tenantId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateTicketStatusRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, tenantId));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<TicketResponse> updatePriority(
            @PathVariable UUID id,
            @RequestBody UpdateTicketRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.patchTicket(id, request, tenantId));
    }

    @PatchMapping("/{id}/assignee")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable UUID id,
            @RequestBody AssignTicketRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, tenantId));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.getComments(id, tenantId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @RequestBody AddCommentRequest request,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.addComment(id, request, tenantId));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistoryResponse>> getHistory(
            @PathVariable UUID id,
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.getHistory(id, tenantId));
    }

    @GetMapping("/summary")
    public ResponseEntity<TicketSummaryResponse> getSummary(
            @RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(ticketService.getSummary(tenantId));
    }
}


