import re

with open('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken assignments
content = re.compile(r'tenantASiteId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantASiteId = tx.execute(status -> {', content)

content = re.compile(r'tenantADeviceId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantADeviceId = tx.execute(status -> {', content)

content = re.compile(r'tenantAAlertId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantAAlertId = tx.execute(status -> {', content)

content = re.compile(r'tenantAProviderId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantAProviderId = tx.execute(status -> {', content)

content = re.compile(r'tenantBSiteId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBSiteId = tx.execute(status -> {', content)

content = re.compile(r'tenantBDeviceId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBDeviceId = tx.execute(status -> {', content)

content = re.compile(r'tenantBAlertId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBAlertId = tx.execute(status -> {', content)

content = re.compile(r'tenantBProviderId = TenantContext\.setCurrentTenant\(TENANT_B\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_B);\n        try {\n            tenantBProviderId = tx.execute(status -> {', content)

content = re.compile(r'tenantATicketId = TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{\s*tx\.execute\(status -> \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        try {\n            tenantATicketId = tx.execute(status -> {', content)

# Fix test8
content = re.compile(r'UUID tenantASite2Id = new TransactionTemplate\(transactionManager\)\.execute\(status -> \{\s*TenantContext\.setCurrentTenant\(TENANT_A\);\s*try \{', re.MULTILINE).sub(
    'TenantContext.setCurrentTenant(TENANT_A);\n        UUID tenantASite2Id;\n        try {\n            tenantASite2Id = new TransactionTemplate(transactionManager).execute(status -> {', content)


with open('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'w', encoding='utf-8') as f:
    f.write(content)
