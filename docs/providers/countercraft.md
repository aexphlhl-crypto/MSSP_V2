# CounterCraft Provider Integration Documentation

## Overview
**Provider Name**: CounterCraft Deception Director  
**Category**: Cyber Deception & Threat Intelligence  
**Integration Status**: `READY_FOR_CREDENTIALS`  

CounterCraft is an automated cyber deception platform that detects unauthorized lateral movement, credential theft, and targeted attacks using synthetic environments. This document specifies the REST API v2 contract for MSP Platform integration.

---

## 1. Authentication
* **Authentication Method**: API Key Header Authentication.
* **Headers**:
  ```http
  Authorization: Token <countercraft_api_token>
  Accept: application/json
  Content-Type: application/json
  ```

### Authentication Verification Sample Request & Response
**Request**:
```http
GET /api/v2/auth/verify HTTP/1.1
Host: deception.example.com
Authorization: Token cc_token_881923ab09...
Accept: application/json
```

**Response**:
```json
{
  "authenticated": true,
  "user": "msp_sec_admin",
  "role": "API_READ_ONLY",
  "organization": "MSP Central Tenant"
}
```

---

## 2. API Version & Base URL
* **API Version**: CounterCraft REST API v2
* **Base URL**: `https://{countercraft_host}/api/v2`

---

## 3. Capabilities
1. **Deception Endpoints**: Query decoy host machines, synthetic breadcrumbs, and active honeypots (`/api/v2/deception-hosts`).
2. **Security Events**: Ingest real-time adversary activity logs, shell commands, credential interactions, and IOCs (`/api/v2/events`).
3. **Incidents & Threat Vulnerabilities**: Fetch correlated attack campaigns, MITRE ATT&CK mappings, and adversary profiles (`/api/v2/incidents`).
4. **Security Alerts**: Retrieve active high-severity deception alerts (`/api/v2/alerts`).

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 100 requests / minute.
* **Pagination**: `limit` (default 50, max 200) and `offset`.
* **Timeout**: 30 seconds HTTP timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Verify Token | `GET` | `/auth/verify` | Validate API token and connectivity | `READY_FOR_CREDENTIALS` |
| List Deception Hosts | `GET` | `/deception-hosts` | Fetch active honeypots and deception hosts | `READY_FOR_CREDENTIALS` |
| List Security Events | `GET` | `/events` | Ingest deception events and IOC telemetry | `READY_FOR_CREDENTIALS` |
| List Threat Incidents | `GET` | `/incidents` | Fetch correlated attack campaigns and MITRE data | `READY_FOR_CREDENTIALS` |
| List Deception Alerts | `GET` | `/alerts` | Query active deception alerts | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/deception-hosts` (Endpoints)
**Response Placeholder**:
```json
{
  "count": 1,
  "results": [
    {
      "id": "dec-host-101",
      "name": "Decoy-SWIFT-Server",
      "ip_address": "10.0.99.5",
      "os": "Windows Server 2022",
      "status": "ACTIVE_LISTENING"
    }
  ]
}
```

### GET `/events` (Security Events)
**Response Placeholder**:
```json
{
  "count": 1,
  "results": [
    {
      "event_id": "evt-77182",
      "timestamp": "2026-08-11T08:45:00Z",
      "deception_host_id": "dec-host-101",
      "event_type": "CREDENTIAL_USE",
      "source_ip": "10.0.1.150",
      "details": {
        "user_attempted": "admin_backup",
        "protocol": "SMB"
      }
    }
  ]
}
```

### GET `/incidents` (Vulnerabilities / Threat Intelligence)
**Response Placeholder**:
```json
{
  "count": 1,
  "results": [
    {
      "incident_id": "inc-301",
      "campaign_name": "Lateral Movement in Segment B",
      "mitre_tactic": "T1078 - Valid Accounts",
      "severity": "HIGH",
      "status": "OPEN",
      "created_at": "2026-08-11T08:46:00Z"
    }
  ]
}
```

### GET `/alerts` (Alerts)
**Response Placeholder**:
```json
{
  "count": 1,
  "results": [
    {
      "alert_id": "alt-cc-992",
      "title": "Adversary Interacted with Decoy SWIFT Server",
      "severity": "CRITICAL",
      "timestamp": "2026-08-11T08:45:10Z"
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
