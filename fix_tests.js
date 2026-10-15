const fs = require('fs');
let content = fs.readFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'utf8');

content = content.replace(/tenantASiteId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantASiteId = tx.execute(status -> {');

content = content.replace(/tenantADeviceId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantADeviceId = tx.execute(status -> {');

content = content.replace(/tenantAAlertId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantAAlertId = tx.execute(status -> {');

content = content.replace(/tenantAProviderId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantAProviderId = tx.execute(status -> {');

content = content.replace(/tenantBSiteId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBSiteId = tx.execute(status -> {');

content = content.replace(/tenantBDeviceId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBDeviceId = tx.execute(status -> {');

content = content.replace(/tenantBAlertId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBAlertId = tx.execute(status -> {');

content = content.replace(/tenantBProviderId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBProviderId = tx.execute(status -> {');

content = content.replace(/tenantATicketId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantATicketId = tx.execute(status -> {');

content = content.replace(/UUID tenantASite2Id = new TransactionTemplate\(transactionManager\)\.execute\(status -> \{\s*TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{/gm,
    'TenantContext.setCurrentTenant(TENANT_A);\n        UUID tenantASite2Id;\n        try {\n            tenantASite2Id = new TransactionTemplate(transactionManager).execute(status -> {');


fs.writeFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', content);
