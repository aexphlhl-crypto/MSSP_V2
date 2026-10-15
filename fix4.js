const fs = require('fs');

let content = fs.readFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'utf8');

if (!content.includes('import org.springframework.jdbc.core.JdbcTemplate;')) {
    content = content.replace('import org.springframework.test.web.servlet.MockMvc;', 'import org.springframework.test.web.servlet.MockMvc;\nimport org.springframework.jdbc.core.JdbcTemplate;');
}

if (!content.includes('private JdbcTemplate jdbcTemplate;')) {
    content = content.replace('private PlatformTransactionManager transactionManager;', 'private PlatformTransactionManager transactionManager;\n    @Autowired private JdbcTemplate jdbcTemplate;');
}

content = content.replace('tx.execute(status -> {', 'jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1000");\n        tx.execute(status -> {');

content = content.replace(/planRepository\.deleteAll\(\);/g, '');

content = content.replace('// =========================================================================', 
    'TenantContext.clear();\n        tx.execute(status -> {\n            planRepository.deleteAll();\n            return null;\n        });\n\n    // =========================================================================');


fs.writeFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', content);
