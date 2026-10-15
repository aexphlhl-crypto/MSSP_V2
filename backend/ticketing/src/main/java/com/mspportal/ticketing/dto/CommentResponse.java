package com.mspportal.ticketing.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class CommentResponse {
    private UUID id;
    private UUID ticketId;
    private String authorId;
    private String content;
    private boolean internal;
    private Instant createdAt;
}
