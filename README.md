# MSP-Portal

MSP-Portal is a Managed Service Provider (MSP) SaaS platform.

## Architecture

This repository is organized as a monorepo containing both the frontend and backend applications.

### Folder Tree

```
/
├── backend/                  # Java 21 + Spring Boot 3.x Modular Monolith
│   ├── pom.xml               # Parent Aggregator POM
│   ├── application/          # Main Spring Boot application runner & configurations
│   ├── common/               # Shared kernel: Base entities, exceptions (NO business logic)
│   ├── auth/                 # Domain: Users, roles, tenants/companies
│   ├── subscription/         # Domain: Plans, feature entitlements
│   ├── ticketing/            # Domain: Tickets, AI-triage
│   ├── security/             # Domain: Vulnerability mgmt, connectors (OpenVAS, CrowdStrike, etc.)
│   ├── backup/               # Domain: Backup jobs, connectors (Commvault, Veeam, etc.)
│   ├── monitoring/           # Domain: Device/agent monitoring
│   ├── reporting/            # Domain: Cross-module report generation
│   └── integration-core/     # Shared abstraction layer for vendor connectors
└── frontend/                 # React 18 + Vite + TypeScript
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx          # Entry point
        ├── App.tsx           # Routing
        ├── pages/            # Page components (Login, Dashboard, Security, etc.)
        └── shared/           # Shared components and utilities
```

### Module Boundaries

The backend is built as a **Modular Monolith**. Each domain (e.g., `auth`, `ticketing`) is isolated in its own Maven module.
*   **No Cross-Domain Dependencies:** Business modules must not depend on each other. If `ticketing` needs user information, it must be fetched via explicit interfaces (API/Events) rather than direct entity import.
*   **Shared Kernel:** The `common` module sits at the bottom of the dependency graph and contains cross-cutting concerns like `BaseTenantEntity` and generic exceptions.
*   **VendorConnector Abstraction:** The `integration-core` module defines standard interfaces (like `VendorConnector`). The `security`, `backup`, and `monitoring` modules implement these interfaces to interact with external vendor APIs (e.g., Veeam, CrowdStrike) without leaking vendor-specific details into the core business logic.

Please refer to [ARCHITECTURE.md](ARCHITECTURE.md) for detailed guidelines on tenant isolation and subscription tier gating.
