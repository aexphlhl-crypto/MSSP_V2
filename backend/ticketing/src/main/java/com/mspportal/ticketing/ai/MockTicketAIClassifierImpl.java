package com.mspportal.ticketing.ai;

import com.mspportal.ticketing.enums.TicketCategory;
import com.mspportal.ticketing.enums.TicketPriority;
import org.springframework.stereotype.Service;

@Service
public class MockTicketAIClassifierImpl implements TicketAIClassifier {

    @Override
    public TicketClassificationResult classify(String text) {
        if (text == null) {
            return new TicketClassificationResult(TicketCategory.OTHER, TicketPriority.LOW, 1.0, "No text provided");
        }
        
        String lowerText = text.toLowerCase();
        
        if (lowerText.contains("server") || lowerText.contains("down")) {
            return new TicketClassificationResult(TicketCategory.SERVER, TicketPriority.CRITICAL, 0.95, "Keywords 'server' or 'down' detected");
        } else if (lowerText.contains("network") || lowerText.contains("internet")) {
            return new TicketClassificationResult(TicketCategory.NETWORK, TicketPriority.HIGH, 0.90, "Network related keywords detected");
        } else if (lowerText.contains("security") || lowerText.contains("virus") || lowerText.contains("breach")) {
            return new TicketClassificationResult(TicketCategory.SECURITY, TicketPriority.CRITICAL, 0.99, "Security related keywords detected");
        } else if (lowerText.contains("backup")) {
            return new TicketClassificationResult(TicketCategory.BACKUP, TicketPriority.HIGH, 0.85, "Backup related keywords detected");
        } else if (lowerText.contains("password") || lowerText.contains("access")) {
            return new TicketClassificationResult(TicketCategory.ACCESS, TicketPriority.MEDIUM, 0.90, "Access related keywords detected");
        }

        return new TicketClassificationResult(TicketCategory.OTHER, TicketPriority.LOW, 0.50, "Default classification");
    }
}
