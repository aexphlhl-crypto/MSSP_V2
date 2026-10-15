package com.mspportal.subscription.dto;

import com.mspportal.subscription.enums.FeatureKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureListResponse {
    private Set<FeatureKey> features;
    private boolean isPlatformAdmin;
}
