# Commvault Provider Integration Documentation

## Overview
**Provider Name**: Commvault Complete Data Protection  
**Category**: Backup & Recovery  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Commvault provides enterprise-grade data protection, backup, recovery, and cloud data management. This documentation defines the API integration contract for the MSP SaaS Platform.

---

## 1. Authentication
* **Authentication Method**: Token-Based Authentication via Commvault WebConsole API.
* **Token Request Endpoint**: `POST /webconsole/api/Login`
* **Token Lifetime**: 30 minutes (requires auto-refresh on 401 Unauthorized).
* **Header Structure**:
  ```http
  Authtoken: QSDK_TOKEN_STRING
  Accept: application/json
  Content-Type: application/json
  ```

### Authentication Sample Request & Response
**Request**:
```http
POST /webconsole/api/Login HTTP/1.1
Host: commvault.example.com
Content-Type: application/json

{
  "mode": 1,
  "username": "msp_admin",
  "password": "BASE64_ENCODED_PASSWORD"
}
```

**Response**:
```json
{
  "userName": "msp_admin",
  "token": "QSDK 1234567890abcdef...",
  "alias": "CommvaultAdmin",
  "userId": 1,
  "errorCode": 0
}
```

---

## 2. API Version & Base URL
* **API Version**: Commvault v11 REST Web Console API
* **Base URL**: `https://{commvault_host}:{port}/webconsole/api`

---

## 3. Capabilities
The MSP Platform integrates the following Commvault capability modules:
1. **Repositories**: Query storage targets, disk libraries, and cloud storage units.
2. **Backup Jobs**: Retrieve configured subclients, backup sets, and schedules.
3. **Backup Executions**: Fetch job execution status, duration, processed data size, and completion codes.
4. **Alerts & Health Summary**: Monitor active backup alerts, errors, and storage capacity metrics.

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 100 requests / minute per API token.
* **Pagination**: Query params `pageNo` (1-indexed) and `pageSize` (default: 50, max: 200).
* **Timeout**: 30 seconds HTTP client request timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Authenticate | `POST` | `/Login` | Exchange credentials for session Authtoken | `READY_FOR_CREDENTIALS` |
| List Storage Libraries | `GET` | `/Library` | Fetch all storage repositories and capacity | `READY_FOR_CREDENTIALS` |
| List Subclients (Jobs) | `GET` | `/Subclient` | Retrieve defined backup jobs and subclients | `READY_FOR_CREDENTIALS` |
| List Job Executions | `GET` | `/Job` | Fetch running and historical backup executions | `READY_FOR_CREDENTIALS` |
| List Backup Alerts | `GET` | `/Alert` | Query active system & backup alerts | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/Library` (Repositories)
**Response Placeholder**:
```json
{
  "response": [
    {
      "libraryId": 101,
      "libraryName": "Primary-Disk-Library",
      "capacityBytes": 109951162777600,
      "freeSpaceBytes": 43980465111040,
      "status": "ONLINE"
    }
  ]
}
```

### GET `/Subclient` (Backup Jobs)
**Response Placeholder**:
```json
{
  "subclientProperties": [
    {
      "subclientId": 201,
      "subclientName": "SQL-Database-Backup",
      "appName": "SQL Server",
      "clientName": "db-prod-01",
      "isEnabled": true
    }
  ]
}
```

### GET `/Job` (Executions)
**Response Placeholder**:
```json
{
  "jobs": [
    {
      "jobId": 5001,
      "subclientId": 201,
      "jobType": "Full Backup",
      "status": "Completed",
      "startTime": 1723360000,
      "endTime": 1723363600,
      "totalSizeMB": 154200,
      "percentComplete": 100
    }
  ]
}
```

### GET `/Alert` (Alerts)
**Response Placeholder**:
```json
{
  "alerts": [
    {
      "alertId": 901,
      "alertName": "Job Failed",
      "severity": "CRITICAL",
      "detectedTime": 1723362000,
      "description": "Subclient SQL-Database-Backup failed due to network timeout."
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
