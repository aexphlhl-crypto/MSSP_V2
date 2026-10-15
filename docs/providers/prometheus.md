# Prometheus Provider Integration Documentation

## Overview
**Provider Name**: Prometheus  
**Category**: Cloud-Native Infrastructure & Time-Series Monitoring  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Prometheus is an open-source systems monitoring and alerting toolkit designed for time-series data collection. This document specifies the HTTP API v1 integration contract for the MSP Platform.

---

## 1. Authentication
* **Authentication Method**: Bearer Token or HTTP Basic Authentication / Mutual TLS (mTLS).
* **Headers**:
  ```http
  Authorization: Bearer <prometheus_api_token>
  Accept: application/json
  ```

### Authentication Sample Request
```http
GET /api/v1/targets HTTP/1.1
Host: prometheus.example.com
Authorization: Bearer prom_sec_token_991823...
Accept: application/json
```

---

## 2. API Version & Base URL
* **API Version**: Prometheus HTTP API v1
* **Base URL**: `https://{prometheus_host}:9090/api/v1`

---

## 3. Capabilities
1. **Targets (Devices)**: Fetch active scrape targets, endpoints, health status, and target labels (`/api/v1/targets`).
2. **Metrics Query**: Execute PromQL instant queries (`/api/v1/query`) and range queries (`/api/v1/query_range`) for CPU, Memory, Disk, Network.
3. **Alerts**: Ingest currently firing alerts from Prometheus and Alertmanager (`/api/v1/alerts`).
4. **Rules**: Inspect alerting and recording rule evaluations (`/api/v1/rules`).

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 2000 requests / minute.
* **Query Execution Timeout**: Default 30s (`timeout=30s`).
* **Max Points**: 11,000 data points per vector range query.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Endpoint Path | Description | Status |
|---|---|---|---|---|
| Get Active Targets | `GET` | `/targets` | Fetch target endpoints and scrape state | `READY_FOR_CREDENTIALS` |
| Instant PromQL Query | `GET` | `/query` | Evaluate PromQL expression at a point in time | `READY_FOR_CREDENTIALS` |
| Range PromQL Query | `GET` | `/query_range` | Evaluate PromQL over a time range | `READY_FOR_CREDENTIALS` |
| List Active Alerts | `GET` | `/alerts` | Query active fired alerts | `READY_FOR_CREDENTIALS` |
| List Alert Rules | `GET` | `/rules` | Fetch configured alerting rules | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### GET `/targets` (Monitored Devices)
**Response Placeholder**:
```json
{
  "status": "success",
  "data": {
    "activeTargets": [
      {
        "discoveredLabels": {
          "__address__": "10.0.1.20:9100",
          "job": "node-exporter"
        },
        "labels": {
          "instance": "k8s-node-01",
          "job": "node-exporter"
        },
        "scrapeUrl": "http://10.0.1.20:9100/metrics",
        "health": "up",
        "lastScrape": "2026-08-11T09:10:00Z"
      }
    ]
  }
}
```

### GET `/query?query=up` (Instant Query)
**Response Placeholder**:
```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "__name__": "up",
          "instance": "k8s-node-01",
          "job": "node-exporter"
        },
        "value": [ 1723363800, "1" ]
      }
    ]
  }
}
```

### GET `/alerts` (Active Alerts)
**Response Placeholder**:
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "labels": {
          "alertname": "NodeFilesystemSpaceFillingUp",
          "severity": "critical",
          "instance": "k8s-node-01"
        },
        "annotations": {
          "summary": "Filesystem on k8s-node-01 is free space < 10%"
        },
        "state": "firing",
        "activeAt": "2026-08-11T08:30:00Z"
      }
    ]
  }
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
