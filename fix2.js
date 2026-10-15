const fs = require('fs');
let content = fs.readFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', 'utf8');

content = content.replace(/return null;
            }\);
        } finally { TenantContext\.clear\(\); }/g, 
    'return null;\n            });\n        } finally { TenantContext.clear(); }');

content = content.replace(/} finally { TenantContext\.clear\(\); }\n        }\);/g, 
    'return null;\n            });\n        } finally { TenantContext.clear(); }');

fs.writeFileSync('backend/application/src/test/java/com/mspportal/application/TicketDomainSecurityTest.java', content);
