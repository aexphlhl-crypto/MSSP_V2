package com.mspportal.integrationcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NormalizedAlert {
    private String externalId;
    private String title;
    private String description;
    private String severity;
    private String status;
    private Instant occurredAt;
    private Instant recoveredAt;
    private String source;
}
