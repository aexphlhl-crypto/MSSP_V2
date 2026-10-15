package com.mspportal.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageResponse {
    private String planName;
    private List<UsageCategoryResponse> categories;
}
