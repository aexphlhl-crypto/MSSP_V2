package com.mspportal.integrationcore;

import com.mspportal.integrationcore.entity.ProviderError;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ProviderErrorMappingTest {

    @Test
    void testProviderErrorMapping() {
        ProviderError error = new ProviderError();
        UUID syncRunId = UUID.randomUUID();
        error.setSyncRunId(syncRunId);
        error.setErrorType("TIMEOUT");
        error.setErrorMessage("Connection timeout during provider sync");
        error.setOccurredAt(Instant.now());

        assertNotNull(error.getSyncRunId());
        assertEquals("TIMEOUT", error.getErrorType());
        assertEquals(syncRunId, error.getSyncRunId());
    }
}
