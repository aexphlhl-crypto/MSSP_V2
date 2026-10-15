package com.mspportal.ticketing.dto;

import lombok.Data;

@Data
public class AddCommentRequest {
    private String content;
    private boolean internal = false; // Note: Service will override this for customer roles
}
