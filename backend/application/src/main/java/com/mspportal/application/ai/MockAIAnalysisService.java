package com.mspportal.application.ai;

import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.security.dto.SecurityEventResponse;
import com.mspportal.ticketing.dto.TicketResponse;
import com.mspportal.application.domain.OperationalIncident;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class MockAIAnalysisService {

    public AIAnalysisResult analyzeIncident(OperationalIncident incident, String rawProviderData) {
        AIAnalysisResult result = new AIAnalysisResult();
        result.setType("INCIDENT");
        
        result.setSummary("Correlated operational incident across multiple signals.");
        result.setSeverity("HIGH");
        result.setPriority("HIGH");
        result.setCategory("CROSS_DOMAIN_INCIDENT");
        result.setConfidence(0.90);
        result.setRecommendations(Arrays.asList(
                "Review correlated alerts",
                "Investigate root cause based on hypothesis",
                "Coordinate with affected teams"
        ));
        result.setSuggestedActions(Arrays.asList("Isolate Systems", "Initiate Recovery"));
        result.setReasoning("AI analysis indicates multiple alerts from " + incident.getProviderName() + " share a common root cause.");
        
        incident.setCorrelationExplanation("The events correlate based on shared provider object ID: " + incident.getProviderObjectId());
        incident.setRecommendedActions(result.getRecommendations());
        incident.setRootCauseHypothesis("Hypothesized root cause based on raw data context: " + (rawProviderData != null ? rawProviderData : "Unknown"));
        
        return result;
    }

    public String getAdvancedAnalysisJson(OperationalIncident incident, String rawProviderData) {
        try {
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("Summary", "Correlated operational incident across multiple signals.");
            response.put("Root Cause Hypothesis", "Hypothesized root cause based on raw data context: " + (rawProviderData != null ? rawProviderData : "Unknown"));
            response.put("Evidence", Arrays.asList("Shared IP address", "Correlated time window", "Provider Object IDs: " + incident.getProviderObjectId()));
            response.put("Impact", "High impact on tenant operations");
            response.put("Recommended Actions", Arrays.asList("Review correlated alerts", "Investigate root cause based on hypothesis", "Coordinate with affected teams"));
            response.put("Confidence", 0.90);
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(response);
        } catch (Exception e) {
            return "{}";
        }
    }

    public AIAnalysisResult analyzeTicket(TicketResponse ticket) {
        AIAnalysisResult result = new AIAnalysisResult();
        result.setType("TICKET");
        
        String desc = ticket.getDescription() != null ? ticket.getDescription().toLowerCase() : "";
        
        if (desc.contains("server down") || desc.contains("cannot connect")) {
            result.setSummary("High-priority infrastructure incident detected.");
            result.setSeverity("CRITICAL");
            result.setPriority("CRITICAL");
            result.setCategory("SERVER");
            result.setConfidence(0.95);
            result.setRecommendations(Arrays.asList(
                    "Verify server reachability",
                    "Check network path",
                    "Check power/VM status",
                    "Escalate to infrastructure team"
            ));
            result.setReasoning("Keywords indicate a complete loss of service for a critical asset.");
        } else {
            result.setSummary("Standard user request or informational ticket.");
            result.setSeverity("LOW");
            result.setPriority("LOW");
            result.setCategory("GENERAL");
            result.setConfidence(0.80);
            result.setRecommendations(Arrays.asList("Review user request", "Assign to L1 support"));
            result.setReasoning("No critical keywords detected in ticket description.");
        }
        
        return result;
    }

    public AIAnalysisResult analyzeSecurityEvent(SecurityEventResponse event) {
        AIAnalysisResult result = new AIAnalysisResult();
        result.setType("SECURITY_EVENT");
        
        if (event.getType().name().equals("RANSOMWARE") || event.getSeverity().name().equals("CRITICAL")) {
            result.setSummary("Potential ransomware or critical security activity detected.");
            result.setSeverity("CRITICAL");
            result.setConfidence(0.98);
            result.setRecommendations(Arrays.asList(
                    "Isolate affected endpoint immediately",
                    "Investigate related processes",
                    "Review recent authentication activity",
                    "Create incident ticket"
            ));
            result.setSuggestedActions(Arrays.asList("Isolate Endpoint", "Create Ticket"));
            result.setReasoning("Event signature strongly correlates with active ransomware deployment.");
        } else {
            result.setSummary("Anomalous activity requiring standard review.");
            result.setSeverity(event.getSeverity().name());
            result.setConfidence(0.85);
            result.setRecommendations(Arrays.asList("Review event details", "Check for related alerts"));
            result.setReasoning("Matches known low/medium severity patterns.");
        }
        return result;
    }

    public AIAnalysisResult analyzeBackupAlert(BackupAlertResponse alert) {
        AIAnalysisResult result = new AIAnalysisResult();
        result.setType("BACKUP_ALERT");
        
        String msg = alert.getMessage() != null ? alert.getMessage().toLowerCase() : "";
        
        if (msg.contains("storage") || msg.contains("full") || msg.contains("insufficient")) {
            result.setSummary("Backup failure is likely caused by insufficient repository capacity.");
            result.setSeverity("HIGH");
            result.setConfidence(0.92);
            result.setRecommendations(Arrays.asList(
                    "Increase repository capacity or clean expired recovery points",
                    "Check repository availability",
                    "Verify storage capacity metrics"
            ));
            result.setReasoning("Error message explicitly states storage limitations.");
        } else {
            result.setSummary("Backup execution failed and may expose the protected workload to data-loss risk.");
            result.setSeverity("HIGH");
            result.setConfidence(0.85);
            result.setRecommendations(Arrays.asList(
                    "Check repository availability",
                    "Review execution logs",
                    "Retry backup"
            ));
            result.setReasoning("General backup failure detected without a specific root cause signature.");
        }
        return result;
    }

    public AIAnalysisResult analyzeMonitoringAlert(AlertResponse alert) {
        AIAnalysisResult result = new AIAnalysisResult();
        result.setType("MONITORING_ALERT");
        
        String msg = alert.getMessage() != null ? alert.getMessage().toLowerCase() : "";
        
        if (msg.contains("cpu") && (msg.contains("95") || msg.contains("high"))) {
            result.setSummary("Sustained high CPU usage detected.");
            result.setSeverity("HIGH");
            result.setConfidence(0.88);
            result.setRecommendations(Arrays.asList(
                    "Inspect running processes",
                    "Check memory pressure",
                    "Review recent deployments",
                    "Create ticket if persistent"
            ));
            result.setReasoning("CPU threshold exceeded for multiple consecutive polling intervals.");
        } else {
            result.setSummary("Resource threshold alert.");
            result.setSeverity("MEDIUM");
            result.setConfidence(0.75);
            result.setRecommendations(Arrays.asList("Acknowledge alert", "Monitor for recurrence"));
            result.setReasoning("Standard threshold breach.");
        }
        return result;
    }
}
