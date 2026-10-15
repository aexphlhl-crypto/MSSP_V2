# Bacula Enterprise Provider Integration Documentation

## Overview
**Provider Name**: Bacula Enterprise  
**Category**: Backup & Recovery  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Bacula Enterprise provides high-performance, open-source-based enterprise data backup and recovery. This document details the REST API specifications for MSP Platform integration.

---

## 1. Authentication
* **Authentication Method**: API Token Authentication or HTTP Basic Authentication via Bacula REST API / Baculum API.
* **Token Endpoint**: `POST /api/v1/auth/login`
* **Headers**:
  ```http
  Authorization: Bearer <api_token>
  Accept: application/json
  Content-Type: application/json
  ```
* **Token Lifetime**: 24 hours.

### Authentication Sample Request & Response
**Request**:
```http
POST /api/v1/auth/login HTTP/1.1
Host: bacula-director.example.com
Content-Type: application/json

{
  "username": "msp_operator",
  "password": "SECURE_BACULA_PASSWORD"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "token": "bacula_token_9876543210fedcba...",
    "expires_at": "2026-08-12T09:00:00Z"
  }
}
```

---

## 2. API Version & Base URL
* **API Version**: Bacula REST API v1.0
* **Base URL**: `https://{bacula_host}:9096/api/v1`

---

## 3. Capabilities
1. **Repositories**: Query Storage daemons, Volume Pools, and media capacities.
2. **Backup Jobs**: Monitor configured Job Resource definitions and schedules across Director clients.
3. **Executions**: Retrieve completed, running, or failed job executions (JobBytes, JobFiles, JobStatus).
4. **Alerts**: Ingest Bacula Director warning and error messages.

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 200 requests / minute per IP/token.
* **Pagination**: `page` (1-indexed) and `limit` (max 500 records).
* **Timeout**: 30 seconds HTTP timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| User Login | `POST` | `/auth/login` | Authenticate and retrieve Bearer token | `READY_FOR_CREDENTIALS` |
| List Storage Pools | `GET` | `/pools` | Fetch storage pools and volume metrics | `READY_FOR_CREDENTIALS` |
| List Backup Jobs | `GET` | `/jobs` | Query defined Bacula backup jobs | `READY_FOR_CREDENTIALS` |
| List Job Executions | `GET` | `/jobs/executions` | Fetch executed backup job runs | `READY_FOR_CREDENTIALS` |
| List Alerts | `GET` | `/alerts` | Get Bacula Director error and alert logs | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/pools` (Repositories)
**Response Placeholder**:
```json
{
  "output": [
    {
      "poolid": 1,
      "name": "DefaultPool",
      "numvols": 12,
      "maxvols": 100,
      "pooltype": "Backup",
      "volretention": 31536000
    }
  ]
}
```

### GET `/jobs` (Backup Jobs)
**Response Placeholder**:
```json
{
  "output": [
    {
      "jobid": 10,
      "name": "BackupClient1",
      "type": "B",
      "level": "Incremental",
      "client": "web-server-fd",
      "fileset": "Full Set"
    }
  ]
}
```

### GET `/jobs/executions` (Executions)
**Response Placeholder**:
```json
{
  "output": [
    {
      "jobid": 501,
      "name": "BackupClient1",
      "jobstatus": "T",
      "jobstatus_long": "Completed successfully",
      "starttime": "2026-08-11 01:00:00",
      "endtime": "2026-08-11 01:15:22",
      "jobbytes": 10737418240,
      "jobfiles": 4520
    }
  ]
}
```

### GET `/alerts` (Alerts)
**Response Placeholder**:
```json
{
  "output": [
    {
      "alert_id": "bac-771",
      "jobid": 498,
      "level": "ERROR",
      "message": "Fatal Error: Storage daemon Connection Refused",
      "time": "2026-08-10 22:30:11"
    }
  ]
}
```

## Backend Implementation Status

* **Mapped Endpoints**: GET /jobs (Implemented statically by adapter)
* **UNSUPPORTED**: Repositories, Executions, Alerts currently return empty or unsupported lists in the backend adapter.
* **JSON Structures Returned**: 
  ``json
  {
    "mapped": { "name": "[Provider] Job 1", "status": "READY_FOR_CREDENTIALS" },
    "raw": "GET /api/v1/jobs HTTP/1.1"
  }
  ``
