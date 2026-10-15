package com.mspportal.subscription.dto;

import com.mspportal.subscription.enums.FeatureKey;
import com.mspportal.subscription.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MySubscriptionResponse {
    private String planName;
    private SubscriptionStatus status;
    private Instant startAt;
    private Instant endAt;
    private Set<FeatureKey> features;
    private boolean isPlatformAdmin;
}
