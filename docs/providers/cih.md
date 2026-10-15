# Cyber Incident Hub (CIH) Provider Integration Documentation

## Overview
**Provider Name**: Cyber Incident Hub (CIH)  
**Category**: Security & Threat Intelligence  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Cyber Incident Hub (CIH) provides centralized cyber threat intelligence, vulnerability correlation, and security incident response feeds. This document defines the REST API v1 integration specifications.

---

## 1. Authentication
* **Authentication Method**: Bearer Token or API Key.
* **Token Endpoint**: `POST /api/v1/auth/token`
* **Headers**:
  ```http
  Authorization: Bearer <cih_jwt_token>
  X-CIH-API-Key: <optional_static_key>
  Accept: application/json
  Content-Type: application/json
  ```

### Authentication Sample Request & Response
**Request**:
```http
POST /api/v1/auth/token HTTP/1.1
Host: cih.example.com
Content-Type: application/json

{
  "client_id": "msp_tenant_client",
  "client_secret": "SECURE_CIH_SECRET"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

---

## 2. API Version & Base URL
* **API Version**: CIH REST API v1
* **Base URL**: `https://{cih_host}/api/v1`

---

## 3. Capabilities
1. **Asset Endpoints**: Query registered enterprise enclaves, monitored endpoints, and asset criticality ratings (`/api/v1/assets/endpoints`).
2. **Threat Intel Events**: Ingest STIX/TAXII threat feed events, IOC hashes, domain blocklists, and adversary signatures (`/api/v1/threat-intel/events`).
3. **Vulnerabilities**: Retrieve published CVE vulnerabilities, zero-day advisories, and patch status (`/api/v1/vulnerabilities`).
4. **Security Alerts**: Monitor incident alerts, severity levels, and automated response recommendations (`/api/v1/alerts`).

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 300 requests / minute per client application.
* **Pagination**: `page` (1-indexed) and `per_page` (default 50, max 100).
* **Timeout**: 30 seconds HTTP client connection timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Request Access Token | `POST` | `/auth/token` | Obtain JWT token with client secret | `READY_FOR_CREDENTIALS` |
| List Endpoints | `GET` | `/assets/endpoints` | Fetch monitored asset endpoints | `READY_FOR_CREDENTIALS` |
| List Threat Intel Events | `GET` | `/threat-intel/events` | Query threat intelligence & IOC events | `READY_FOR_CREDENTIALS` |
| List Vulnerabilities | `GET` | `/vulnerabilities` | Retrieve CVE vulnerabilities & advisories | `READY_FOR_CREDENTIALS` |
| List Security Alerts | `GET` | `/alerts` | Get incident alerts and response actions | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/assets/endpoints` (Endpoints)
**Response Placeholder**:
```json
{
  "data": [
    {
      "endpoint_id": "ep-cih-88",
      "hostname": "db-cluster-node1",
      "ip_address": "10.10.4.12",
      "criticality": "HIGH",
      "status": "MONITORED"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 1
  }
}
```

### GET `/threat-intel/events` (Security Events)
**Response Placeholder**:
```json
{
  "data": [
    {
      "event_id": "tie-9012",
      "indicator_type": "IP_MALICIOUS",
      "indicator_value": "198.51.100.45",
      "confidence": 95,
      "threat_actor": "APT29",
      "first_seen": "2026-08-11T04:00:00Z"
    }
  ]
}
```

### GET `/vulnerabilities` (Vulnerabilities)
**Response Placeholder**:
```json
{
  "data": [
    {
      "cve_id": "CVE-2026-12345",
      "title": "Remote Code Execution in Web Component",
      "cvss_score": 9.8,
      "severity": "CRITICAL",
      "patch_available": true
    }
  ]
}
```

### GET `/alerts` (Alerts)
**Response Placeholder**:
```json
{
  "data": [
    {
      "alert_id": "alt-cih-551",
      "title": "Critical Vulnerability Exploit Detected",
      "severity": "CRITICAL",
      "status": "NEW",
      "created_at": "2026-08-11T09:00:00Z"
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
