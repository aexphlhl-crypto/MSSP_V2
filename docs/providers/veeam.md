# Veeam Backup & Replication Provider Integration Documentation

## Overview
**Provider Name**: Veeam Backup & Replication (VBR)  
**Category**: Backup & Recovery  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Veeam Backup & Replication provides virtual, physical, and cloud data management. This document specifies the REST API contract for integration into the MSP SaaS Platform.

---

## 1. Authentication
* **Authentication Method**: OAuth 2.0 Resource Owner Password Credentials Grant.
* **Token Endpoint**: `POST /api/oauth2/token`
* **Headers**:
  ```http
  Authorization: Bearer <access_token>
  x-api-version: 1.2-rev1
  Content-Type: application/x-www-form-urlencoded
  ```
* **Token Lifetime**: 15 minutes (with refresh token support).

### Authentication Sample Request & Response
**Request**:
```http
POST /api/oauth2/token HTTP/1.1
Host: veeam-br.example.com
Content-Type: application/x-www-form-urlencoded
x-api-version: 1.2-rev1

grant_type=password&username=msp_service_account&password=SECURE_PASSWORD
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "def5020084..."
}
```

---

## 2. API Version & Base URL
* **API Version**: Veeam REST API v1.2 (`x-api-version: 1.2-rev1`)
* **Base URL**: `https://{veeam_host}:9419/api`

---

## 3. Capabilities
1. **Repositories**: Query backup repositories, capacity, free space, and repository type (Scale-Out, Linux, Windows, Cloud).
2. **Backup Jobs**: Monitor configured backup jobs, policies, and schedules.
3. **Executions (Sessions)**: Track backup job sessions, status (Success, Warning, Failed), throughput, and transfer statistics.
4. **Alerts**: Ingest active events, warnings, and job failure alerts.

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 500 requests / minute per client token.
* **Pagination**: `skip` (offset) and `limit` (max 1000 per request).
* **Timeout**: 30 seconds HTTP connection timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Request Token | `POST` | `/oauth2/token` | Obtain JWT OAuth2 access token | `READY_FOR_CREDENTIALS` |
| List Repositories | `GET` | `/v1/repositories` | Fetch storage repositories info | `READY_FOR_CREDENTIALS` |
| List Backup Jobs | `GET` | `/v1/jobs` | Retrieve list of configured jobs | `READY_FOR_CREDENTIALS` |
| List Backup Sessions | `GET` | `/v1/sessions` | Fetch job execution history and sessions | `READY_FOR_CREDENTIALS` |
| List Backup Alerts | `GET` | `/v1/alerts` | Get active alerts and events | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/v1/repositories` (Repositories)
**Response Placeholder**:
```json
{
  "data": [
    {
      "id": "e58e32c8-9a1b-4f9e-a81d-0123456789ab",
      "name": "Default Backup Repository",
      "type": "WinLocal",
      "capacityGB": 10000.0,
      "freeGB": 4200.5,
      "path": "D:\\Backups"
    }
  ],
  "pagination": {
    "total": 1,
    "count": 1,
    "skip": 0,
    "limit": 50
  }
}
```

### GET `/v1/jobs` (Jobs)
**Response Placeholder**:
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
      "name": "VM-Production-Daily",
      "type": "VSphereBackup",
      "isDisabled": false,
      "repositoryId": "e58e32c8-9a1b-4f9e-a81d-0123456789ab"
    }
  ]
}
```

### GET `/v1/sessions` (Executions)
**Response Placeholder**:
```json
{
  "data": [
    {
      "id": "c9d8e7f6-5a4b-3c2d-1e0f-9876543210fe",
      "jobId": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
      "jobName": "VM-Production-Daily",
      "state": "Stopped",
      "result": "Success",
      "creationTime": "2026-08-10T23:00:00Z",
      "endTime": "2026-08-10T23:45:12Z",
      "transferredDataBytes": 48590123456
    }
  ]
}
```

### GET `/v1/alerts` (Alerts)
**Response Placeholder**:
```json
{
  "data": [
    {
      "id": "alt-8812",
      "severity": "Warning",
      "message": "Low disk space on repository Default Backup Repository",
      "timestamp": "2026-08-11T02:15:00Z"
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
