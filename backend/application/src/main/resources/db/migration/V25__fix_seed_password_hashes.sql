UPDATE users
SET password_hash = '$2a$10$VkzzRT.oE0O0aAuPhJ69..KtxZ28z0UHH3H717.msjiaON7lYtSWW'
WHERE email IN (
    'admin@mspportal.local',
    'bronze@mspportal.local',
    'gold@mspportal.local'
);
