package com.mspportal.security.mock;

import com.mspportal.security.enums.EndpointProtectionStatus;
import com.mspportal.security.enums.SecurityEventSeverity;
import com.mspportal.security.enums.SecurityEventType;
import com.mspportal.security.enums.VulnerabilitySeverity;
import org.springframework.stereotype.Service;

@Service
public class MockSecurityService {

    public EndpointProtectionStatus calculateMockProtectionStatus(String hostname) {
        String hn = hostname != null ? hostname.toUpperCase() : "";
        if (hn.contains("CRITICAL")) {
            return EndpointProtectionStatus.WARNING;
        } else if (hn.contains("VULNERABLE")) {
            return EndpointProtectionStatus.UNPROTECTED;
        } else {
            return EndpointProtectionStatus.PROTECTED;
        }
    }

    public Integer calculateMockRiskScore(String hostname) {
        String hn = hostname != null ? hostname.toUpperCase() : "";
        if (hn.contains("CRITICAL")) {
            return 95;
        } else if (hn.contains("VULNERABLE")) {
            return 80;
        } else {
            return 20;
        }
    }
}
