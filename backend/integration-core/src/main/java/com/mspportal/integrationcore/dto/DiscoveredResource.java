package com.mspportal.integrationcore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscoveredResource {
    private String externalId;
    private String name;
    private String type;
    private Map<String, Object> rawProperties;
}
