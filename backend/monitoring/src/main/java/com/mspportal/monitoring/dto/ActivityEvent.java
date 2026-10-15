package com.mspportal.monitoring.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ActivityEvent {
    private Instant timestamp;
    private String eventType;
    private String actor;
    private String description;
}
