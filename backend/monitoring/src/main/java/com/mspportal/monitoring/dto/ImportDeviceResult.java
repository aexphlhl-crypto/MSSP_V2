package com.mspportal.monitoring.dto;

public class ImportDeviceResult {
    private int newlyCreated;
    private int updated;
    private int alreadyImported;
    private int failed;

    public ImportDeviceResult() {
    }

    public ImportDeviceResult(int newlyCreated, int updated, int alreadyImported, int failed) {
        this.newlyCreated = newlyCreated;
        this.updated = updated;
        this.alreadyImported = alreadyImported;
        this.failed = failed;
    }

    public int getNewlyCreated() {
        return newlyCreated;
    }

    public void setNewlyCreated(int newlyCreated) {
        this.newlyCreated = newlyCreated;
    }

    public int getUpdated() {
        return updated;
    }

    public void setUpdated(int updated) {
        this.updated = updated;
    }

    public int getAlreadyImported() {
        return alreadyImported;
    }

    public void setAlreadyImported(int alreadyImported) {
        this.alreadyImported = alreadyImported;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }
}
