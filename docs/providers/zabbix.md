# Zabbix Monitoring Provider Integration Documentation

## Overview
**Provider Name**: Zabbix Enterprise Monitoring  
**Category**: Infrastructure & Network Monitoring  
**Integration Status**: `READY_FOR_CREDENTIALS`  

Zabbix is an open-source enterprise monitoring solution for networks, servers, virtual machines, and cloud services. This document specifies the JSON-RPC API integration contract.

---

## 1. Authentication
* **Authentication Method**: JSON-RPC 2.0 API Authentication via `user.login` method or API Token Header.
* **Endpoint**: `POST /api_jsonrpc.php`
* **Header**:
  ```http
  Authorization: Bearer <api_token>
  Content-Type: application/json-rpc
  ```

### Authentication Sample Request & Response
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "user.login",
  "params": {
    "username": "msp_api_user",
    "password": "SECURE_ZABBIX_PASSWORD"
  },
  "id": 1
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": "0424bd59b80767a57576ead1d4cd6778",
  "id": 1
}
```

---

## 2. API Version & Base URL
* **API Version**: Zabbix JSON-RPC 2.0 (Zabbix 6.0/7.0 LTS)
* **Base URL**: `https://{zabbix_host}/zabbix/api_jsonrpc.php`

---

## 3. Capabilities
1. **Sites (Host Groups)**: Categorize hosts by customer tenant, site location, or environment (`hostgroup.get`).
2. **Devices (Hosts)**: Query monitored infrastructure endpoints, IP addresses, interfaces, and status (`host.get`).
3. **Metrics (Items & History)**: Ingest metric definitions, CPU/Memory/Disk performance data (`item.get`, `history.get`).
4. **Alerts & Problems**: Fetch active triggers and system problems with severity levels (`problem.get`, `trigger.get`).

---

## 4. Limits & Rate Constraints
* **Rate Limits**: 1000 requests / minute per API key.
* **Query Limit**: `"limit": 500` objects per payload.
* **Timeout**: 30 seconds HTTP call timeout.

---

## 5. Endpoints Registry (`READY_FOR_CREDENTIALS`)

| Endpoint Name | HTTP Method | Method Name | Description | Status |
|---|---|---|---|---|
| User Login | `POST` | `user.login` | Authenticate and obtain session token | `READY_FOR_CREDENTIALS` |
| List Host Groups | `POST` | `hostgroup.get` | Fetch host groups representing sites | `READY_FOR_CREDENTIALS` |
| List Monitored Hosts | `POST` | `host.get` | Query monitored server and network devices | `READY_FOR_CREDENTIALS` |
| Get Host Items/Metrics | `POST` | `item.get` | Fetch items and performance metrics | `READY_FOR_CREDENTIALS` |
| List Active Problems | `POST` | `problem.get` | Query active problem events and alerts | `READY_FOR_CREDENTIALS` |

---

## 6. Placeholder API Structures

### POST `/api_jsonrpc.php` (`hostgroup.get`)
**Request Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "hostgroup.get",
  "params": {
    "output": ["groupid", "name"]
  },
  "auth": "0424bd59b80767a57576ead1d4cd6778",
  "id": 2
}
```
**Response Placeholder**:
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "groupid": "15",
      "name": "Customer-Acme-HQ"
    }
  ],
  "id": 2
}
```

### POST `/api_jsonrpc.php` (`host.get`)
**Response Placeholder**:
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "hostid": "10084",
      "host": "srv-web-01",
      "name": "Acme Web Server 01",
      "status": "0",
      "interfaces": [
        {
          "ip": "192.168.1.50",
          "dns": "",
          "port": "10050"
        }
      ]
    }
  ],
  "id": 3
}
```

### POST `/api_jsonrpc.php` (`item.get`)
**Response Placeholder**:
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "itemid": "23298",
      "name": "CPU utilization",
      "key_": "system.cpu.util",
      "lastvalue": "14.25",
      "units": "%"
    }
  ],
  "id": 4
}
```

### POST `/api_jsonrpc.php` (`problem.get`)
**Response Placeholder**:
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "eventid": "90123",
      "severity": "4",
      "name": "High CPU utilization on srv-web-01",
      "clock": "1723363000",
      "acknowledged": "0"
    }
  ],
  "id": 5
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
