# Wazuh SIEM & XDR Provider Integration Documentation

## Overview
**Provider Name**: Wazuh Open Source SIEM & XDR  
**Category**: Endpoint Security & Threat Detection  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Wazuh is an open-source security monitoring, threat detection, and compliance platform. This document outlines the REST API v4.x integration contract for the MSP SaaS Platform.

---

## 1. Authentication
* **Authentication Method**: HTTP Basic Auth exchange for JWT Access Token.
* **Token Endpoint**: `GET /security/user/authenticate`
* **Headers**:
  ```http
  Authorization: Bearer <wazuh_jwt_token>
  Accept: application/json
  Content-Type: application/json
  ```
* **Token Lifetime**: 15 minutes.

### Authentication Sample Request & Response
**Request**:
```http
GET /security/user/authenticate HTTP/1.1
Host: wazuh-manager.example.com:55000
Authorization: Basic d2F6dWgtc2VydmljZTpTRUNVUkVfUEFTU1dPUkQ=
```

**Response**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  },
  "error": 0
}
```

---

## 2. API Version & Base URL
* **API Version**: Wazuh REST API v4.x
* **Base URL**: `https://{wazuh_host}:55000`

---

## 3. Capabilities
1. **Security Endpoints (Agents)**: List registered, active, disconnected, and pending Wazuh agents across customer tenants (`/agents`).
2. **Security Events & Integrity**: Ingest FIM (File Integrity Monitoring / Syscheck) logs, rootcheck events, and security logs (`/syscheck/{agent_id}`).
3. **Vulnerabilities**: Query agent vulnerability scan results, severity, and CVE mappings (`/vulnerability/{agent_id}`).
4. **Security Alerts**: Retrieve triggered security alerts, rule IDs, and threat levels (`/alerts`).

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 300 requests / minute per user token.
* **Pagination**: `limit` (default: 500, max: 1000) and `offset`.
* **Timeout**: 30 seconds HTTP timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Authenticate | `GET` | `/security/user/authenticate` | Exchange Basic credentials for JWT session token | `READY_FOR_CREDENTIALS` |
| List Agents | `GET` | `/agents` | Fetch registered security agents | `READY_FOR_CREDENTIALS` |
| List File Integrity Events | `GET` | `/syscheck/{agent_id}` | Retrieve agent syscheck and FIM events | `READY_FOR_CREDENTIALS` |
| List Agent Vulnerabilities | `GET` | `/vulnerability/{agent_id}` | Query vulnerability detector results | `READY_FOR_CREDENTIALS` |
| List Manager Alerts | `GET` | `/alerts` | Ingest real-time security rule alerts | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/agents` (Endpoints)
**Response Placeholder**:
```json
{
  "data": {
    "affected_items": [
      {
        "id": "001",
        "name": "win-dc-01",
        "ip": "192.168.1.10",
        "status": "active",
        "os": {
          "name": "Microsoft Windows Server 2022 DataCenter",
          "version": "10.0.20348"
        },
        "version": "Wazuh v4.7.2"
      }
    ],
    "total_affected_items": 1
  },
  "error": 0
}
```

### GET `/syscheck/001` (Security Events)
**Response Placeholder**:
```json
{
  "data": {
    "affected_items": [
      {
        "file": "C:\\Windows\\System32\\drivers\\etc\\hosts",
        "event": "modified",
        "modification_time": "2026-08-11T07:22:10Z",
        "md5_after": "3394a123f...",
        "uname": "SYSTEM"
      }
    ]
  },
  "error": 0
}
```

### GET `/vulnerability/001` (Vulnerabilities)
**Response Placeholder**:
```json
{
  "data": {
    "affected_items": [
      {
        "cve": "CVE-2024-30078",
        "name": "Windows Wi-Fi Driver Remote Code Execution Vulnerability",
        "severity": "High",
        "status": "VALID",
        "detection_time": "2026-08-10T14:00:00Z"
      }
    ]
  },
  "error": 0
}
```

### GET `/alerts` (Alerts)
**Response Placeholder**:
```json
{
  "data": {
    "affected_items": [
      {
        "timestamp": "2026-08-11T09:12:00.000+0000",
        "rule": {
          "id": "5716",
          "level": 10,
          "description": "SSHD authentication failed multiple times."
        },
        "agent": {
          "id": "002",
          "name": "linux-web-02"
        }
      }
    ]
  },
  "error": 0
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
