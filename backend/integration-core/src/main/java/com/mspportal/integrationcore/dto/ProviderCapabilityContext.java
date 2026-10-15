package com.mspportal.integrationcore.dto;

import com.mspportal.integrationcore.enums.ProviderCapability;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderCapabilityContext {
    private ProviderCapability capability;
    private List<String> providers;
}
