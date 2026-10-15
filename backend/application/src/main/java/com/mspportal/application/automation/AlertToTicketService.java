package com.mspportal.application.automation;

import com.mspportal.application.ai.MockAIAnalysisService;
import com.mspportal.application.ai.AIAnalysisResult;
import com.mspportal.application.correlation.IncidentCorrelationService;
import com.mspportal.application.domain.OperationalIncident;
import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.monitoring.dto.AlertResponse;
import com.mspportal.security.dto.SecurityEventResponse;
import com.mspportal.ticketing.dto.CreateTicketRequest;
import com.mspportal.ticketing.enums.TicketPriority;
import com.mspportal.ticketing.service.TicketService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AlertToTicketService implements OperationalIncidentHandler {

    private final TicketService ticketService;
    private final IncidentCorrelationService incidentCorrelationService;
    private final MockAIAnalysisService mockAIAnalysisService;
    private final boolean isEnabled;

    private final ConcurrentHashMap<String, UUID> incidentTicketMap = new ConcurrentHashMap<>();

    public AlertToTicketService(TicketService ticketService, 
                                IncidentCorrelationService incidentCorrelationService,
                                MockAIAnalysisService mockAIAnalysisService,
                                @Value("${automation.alert-to-ticket.enabled:false}") boolean isEnabled) {
        this.ticketService = ticketService;
        this.incidentCorrelationService = incidentCorrelationService;
        this.mockAIAnalysisService = mockAIAnalysisService;
        this.isEnabled = isEnabled;
    }

    @Override
    public void handleMonitoringAlert(AlertResponse alert, String tenantId) {
        if (!isEnabled || !"CRITICAL".equals(alert.getSeverity().name())) return;
        
        OperationalIncident incident = incidentCorrelationService.correlate(alert);
        String key = incident.getIncidentId().toString();
        if (incidentTicketMap.containsKey(key)) return;
        
        AIAnalysisResult analysis = mockAIAnalysisService.analyzeIncident(incident, alert.getMessage());

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Critical Monitoring Alert: " + alert.getTitle());
        request.setDescription(analysis.getSummary() + "\nReasoning: " + analysis.getReasoning() + 
                               "\nCorrelation: " + incident.getCorrelationExplanation() +
                               "\nProvider: " + incident.getProviderName() + 
                               "\nProvider Object: " + incident.getProviderObjectId() +
                               "\nIncident ID: " + incident.getIncidentId());
        request.setPriority(TicketPriority.CRITICAL);

        try {
            var ticket = ticketService.createTicket(request, tenantId);
            incidentTicketMap.put(key, ticket.getId());
        } catch (Exception e) {
            // Log error
        }
    }

    @Override
    public void handleSecurityEvent(SecurityEventResponse event, String tenantId) {
        if (!isEnabled || !"CRITICAL".equals(event.getSeverity().name())) return;
        
        OperationalIncident incident = incidentCorrelationService.correlate(event);
        String key = incident.getIncidentId().toString();
        if (incidentTicketMap.containsKey(key)) return;
        
        AIAnalysisResult analysis = mockAIAnalysisService.analyzeIncident(incident, event.getDescription());

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Critical Security Incident: " + event.getTitle());
        request.setDescription(analysis.getSummary() + "\nReasoning: " + analysis.getReasoning() + 
                               "\nCorrelation: " + incident.getCorrelationExplanation() +
                               "\nProvider: " + incident.getProviderName() + 
                               "\nProvider Object: " + incident.getProviderObjectId() +
                               "\nIncident ID: " + incident.getIncidentId());
        request.setPriority(TicketPriority.CRITICAL);

        try {
            var ticket = ticketService.createTicket(request, tenantId);
            incidentTicketMap.put(key, ticket.getId());
        } catch (Exception e) {
            // Log error
        }
    }

    @Override
    public void handleBackupAlert(BackupAlertResponse alert, String tenantId) {
        if (!isEnabled || !"CRITICAL".equals(alert.getSeverity().name())) return;
        
        OperationalIncident incident = incidentCorrelationService.correlate(alert);
        String key = incident.getIncidentId().toString();
        if (incidentTicketMap.containsKey(key)) return;
        
        AIAnalysisResult analysis = mockAIAnalysisService.analyzeIncident(incident, alert.getMessage());

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Critical Backup Failure: " + alert.getTitle());
        request.setDescription(analysis.getSummary() + "\nReasoning: " + analysis.getReasoning() + 
                               "\nCorrelation: " + incident.getCorrelationExplanation() +
                               "\nProvider: " + incident.getProviderName() + 
                               "\nProvider Object: " + incident.getProviderObjectId() +
                               "\nIncident ID: " + incident.getIncidentId());
        request.setPriority(TicketPriority.CRITICAL);

        try {
            var ticket = ticketService.createTicket(request, tenantId);
            incidentTicketMap.put(key, ticket.getId());
        } catch (Exception e) {
            // Log error
        }
    }
}
