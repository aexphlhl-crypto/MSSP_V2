package com.mspportal.backup.service;

import lombok.Data;

@Data
public class BackupAlertSummary {
    private long total;
    private long open;
    private long acknowledged;
    private long resolved;
    private long critical;
}
