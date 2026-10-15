package com.mspportal.ticketing.ai;

public interface TicketAIClassifier {
    TicketClassificationResult classify(String text);
}
