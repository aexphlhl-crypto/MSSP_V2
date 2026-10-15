package com.mspportal.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageCategoryResponse {
    private String name;
    private Long used;
    private Long limit; // null or -1 means Unlimited
    private String unit;
    private Double utilization; // percentage, null if limit is unlimited or 0
}
