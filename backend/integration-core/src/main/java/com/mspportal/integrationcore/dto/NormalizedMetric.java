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
public class NormalizedMetric {
    private String metricName;
    private Double value;
    private String unit;
    private Instant timestamp;
    private String source;
}
