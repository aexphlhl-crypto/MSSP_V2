const fs = require('fs');

let content = fs.readFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'utf8');

const setUpTearDownReplacement = 
    @BeforeEach
    public void setUp() {
        tenantAToken = jwtTokenProvider.generateToken("user-a@test.com", "ROLE_CUSTOMER", TENANT_A);
        tenantBToken = jwtTokenProvider.generateToken("user-b@test.com", "ROLE_CUSTOMER", TENANT_B);
        platformAdminToken = jwtTokenProvider.generateToken("admin@test.com", "ROLE_PLATFORM_ADMIN", "system");

        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        tx.execute(status -> {
            Plan p = new Plan();
            p.setName("TEST_PLAN");
            p.setFeatures(java.util.Set.of(com.mspportal.subscription.enums.FeatureKey.TICKETING));
            planRepository.saveAndFlush(p);
            return null;
        });
        Plan plan = planRepository.findAll().get(0);


        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tx.execute(status -> {
                TenantSubscription sub = new TenantSubscription();
                sub.setTenantId(TENANT_A);
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setStartAt(java.time.Instant.now());
                sub.setEndAt(java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS));
                sub.setPlan(plan);
                subscriptionRepository.saveAndFlush(sub);
                return null;
            });
        } finally { TenantContext.clear(); }
        
        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tx.execute(status -> {
                TenantSubscription sub = new TenantSubscription();
                sub.setTenantId(TENANT_B);
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setStartAt(java.time.Instant.now());
                sub.setEndAt(java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS));
                sub.setPlan(plan);
                subscriptionRepository.saveAndFlush(sub);
                return null;
            });
        } finally { TenantContext.clear(); }

        // Create tenant-A data
        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tenantASiteId = tx.execute(status -> {
                Site site = new Site();
                site.setName("Tenant A HQ");
                site.setStatus(SiteStatus.ACTIVE);
                return siteRepository.save(site).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tenantADeviceId = tx.execute(status -> {
                Device device = new Device();
                device.setSiteId(tenantASiteId);
                device.setHostname("server-a.local");
                device.setDeviceType(DeviceType.SERVER);
                device.setStatus(DeviceStatus.ONLINE);
                return deviceRepository.save(device).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tenantAAlertId = tx.execute(status -> {
                Alert alert = new Alert();
                alert.setDeviceId(tenantADeviceId);
                alert.setType("CPU_HIGH");
                alert.setSeverity(AlertSeverity.CRITICAL);
                alert.setTitle("High CPU on server-a");
                alert.setStatus(AlertStatus.OPEN);
                return alertRepository.save(alert).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tenantAProviderId = tx.execute(status -> {
                ProviderConnection pc = new ProviderConnection();
                pc.setProviderType(ProviderType.MONITORING);
                pc.setProviderName("Zabbix");
                pc.setStatus(ProviderStatus.CONNECTED);
                return providerConnectionRepository.save(pc).getId();
            });
        } finally { TenantContext.clear(); }

        // Create tenant-B data
        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tenantBSiteId = tx.execute(status -> {
                Site site = new Site();
                site.setName("Tenant B HQ");
                site.setStatus(SiteStatus.ACTIVE);
                return siteRepository.save(site).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tenantBDeviceId = tx.execute(status -> {
                Device device = new Device();
                device.setSiteId(tenantBSiteId);
                device.setHostname("server-b.local");
                device.setDeviceType(DeviceType.SERVER);
                device.setStatus(DeviceStatus.ONLINE);
                return deviceRepository.save(device).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tenantBAlertId = tx.execute(status -> {
                Alert alert = new Alert();
                alert.setDeviceId(tenantBDeviceId);
                alert.setType("DISK_FULL");
                alert.setSeverity(AlertSeverity.WARNING);
                alert.setTitle("Disk full on server-b");
                alert.setStatus(AlertStatus.OPEN);
                return alertRepository.save(alert).getId();
            });
        } finally { TenantContext.clear(); }

        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tenantBProviderId = tx.execute(status -> {
                ProviderConnection pc = new ProviderConnection();
                pc.setProviderType(ProviderType.BACKUP);
                pc.setProviderName("Veeam");
                pc.setStatus(ProviderStatus.CONNECTED);
                return providerConnectionRepository.save(pc).getId();
            });
        } finally { TenantContext.clear(); }

        // Create a ticket for tenant-A (used in cross-tenant read/update tests)
        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tenantATicketId = tx.execute(status -> {
                Ticket ticket = new Ticket();
                ticket.setTitle("Network slow");
                ticket.setDescription("Users reporting slow network");
                ticket.setCategory(TicketCategory.NETWORK);
                ticket.setPriority(TicketPriority.HIGH);
                ticket.setSource(TicketSource.PORTAL);
                ticket.setRequesterId("user-a@test.com");
                return ticketRepository.save(ticket).getId();
            });
        } finally { TenantContext.clear(); }
    }

    @AfterEach
    public void tearDown() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        TenantContext.setCurrentTenant(TENANT_A);
        try {
            tx.execute(status -> {
                subscriptionRepository.deleteAll();
                ticketHistoryRepository.deleteAll();
                ticketCommentRepository.deleteAll();
                ticketRepository.deleteAll();
                alertRepository.deleteAll();
                deviceRepository.deleteAll();
                siteRepository.deleteAll();
                providerConnectionRepository.deleteAll();
                planRepository.deleteAll();
                return null;
            });
        } finally { TenantContext.clear(); }
        
        TenantContext.setCurrentTenant(TENANT_B);
        try {
            tx.execute(status -> {
                subscriptionRepository.deleteAll();
                ticketHistoryRepository.deleteAll();
                ticketCommentRepository.deleteAll();
                ticketRepository.deleteAll();
                alertRepository.deleteAll();
                deviceRepository.deleteAll();
                siteRepository.deleteAll();
                providerConnectionRepository.deleteAll();
                planRepository.deleteAll();
                return null;
            });
        } finally { TenantContext.clear(); }
    }

    // =========================================================================
    public void test8_deviceSite_mismatch_rejected() throws Exception {
        // Create a second site for Tenant A
        TenantContext.setCurrentTenant(TENANT_A);
        UUID tenantASite2Id;
        try {
            tenantASite2Id = new TransactionTemplate(transactionManager).execute(status -> {
                Site site2 = new Site();
                site2.setName("Tenant A Branch");
                site2.setStatus(SiteStatus.ACTIVE);
                return siteRepository.save(site2).getId();
            });
        } finally { TenantContext.clear(); }

        // Try to create ticket with tenantADeviceId (which belongs to tenantASiteId) + tenantASite2Id (different site)
        String requestBody = """
;

let startIndex = content.indexOf('@BeforeEach');
let endIndex = content.indexOf('public void test8_deviceSite_mismatch_rejected() throws Exception {');
if (startIndex !== -1 && endIndex !== -1) {
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex + 'public void test8_deviceSite_mismatch_rejected() throws Exception {\n        // Create a second site for Tenant A\n        TenantContext.setCurrentTenant(TENANT_A);\n        UUID tenantASite2Id;\n        try {\n            tenantASite2Id = new TransactionTemplate(transactionManager).execute(status -> {\n                Site site2 = new Site();\n                site2.setName("Tenant A Branch");\n                site2.setStatus(SiteStatus.ACTIVE);\n                return siteRepository.save(site2).getId();\n            });\n        } finally { TenantContext.clear(); }\n\n        // Try to create ticket with tenantADeviceId (which belongs to tenantASiteId) + tenantASite2Id (different site)\n        String requestBody = """\n'.length);
    let afterStart = content.indexOf('String requestBody = """', endIndex);
    if(afterStart !== -1) {
       after = content.substring(afterStart + 'String requestBody = """\n'.length);
    }
    
    fs.writeFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', before + setUpTearDownReplacement + after);
}

