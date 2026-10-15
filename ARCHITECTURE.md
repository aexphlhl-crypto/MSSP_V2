# MSP-Portal Architecture Guidelines

This document outlines the core architectural conventions and rules for the MSP-Portal backend.

## 1. Tenant Isolation Strategy

We support multi-tenancy where multiple customer companies (tenants) share the same database instance and schema (**Shared Schema + Tenant ID** approach). 

**Implementation Mechanism:**
*   All entities that belong to a specific tenant must extend `BaseTenantEntity` from the `common` module.
*   This entity utilizes Hibernate's `@TenantId` annotation to implicitly filter all JPA queries by the current user's tenant context.
*   **Justification:** A shared schema is simpler to maintain and migrate (via Flyway) compared to a schema-per-tenant architecture, especially in a monolithic setup. The `@TenantId` feature in Hibernate 6+ provides robust data isolation at the ORM layer, preventing accidental cross-tenant data access without the complexity of dynamic schema routing.

## 2. Module Boundary Rules

The application is structured as a modular monolith. Strict dependency rules are enforced:

```
        [ application ] (Runner)
               |
  -----------------------------------
  |      |      |      |      |     |
 auth  sub  ticket  sec  backup  monitor  report
  |      |      |      |      |     |     |
  -----------------------------------------
               |               |
        [ integration ]   [ common ]
```

*   **Directional Dependencies:** Business modules (`auth`, `ticketing`, `security`, etc.) can depend on `common` and `integration-core`, but **never** on each other.
*   **Package Visibility:** Internal domain logic should be `package-private`. Only interfaces and DTOs intended for cross-module communication (if any are introduced later, e.g., via Spring ApplicationEvents) should be `public`.
*   **The `common` Module:** Also known as the shared kernel. It must not contain any business logic or depend on any other internal modules.

## 3. Subscription Tier Gating (Future)

The platform supports different subscription plans (Bronze, Silver, Gold) that grant access to specific features.
*   **Mechanism:** Gating will be handled via the `subscription` module intercepting requests or providing authorization checks.
*   We will use Spring Security annotations (e.g., `@PreAuthorize("@entitlementEvaluator.hasFeature('SECURITY_ADVANCED')")`) to guard endpoints based on the tenant's current active plan. The feature flags will be mapped to the tiers in the `subscription` domain.
