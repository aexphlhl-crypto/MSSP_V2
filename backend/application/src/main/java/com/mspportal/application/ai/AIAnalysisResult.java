package com.mspportal.application.ai;

import lombok.Data;
import java.util.List;

@Data
public class AIAnalysisResult {
    private String type;
    private String summary;
    private String severity;
    private String priority;
    private String category;
    private Double confidence;
    private List<String> recommendations;
    private List<String> suggestedActions;
    private String reasoning;
    private String suggestedTitle;
    private String suggestedDescription;
    private String rootCauseHypothesis;
    private List<String> evidence;
    private String impact;
}
