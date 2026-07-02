const fs = require('fs');
const source = fs.readFileSync('lib/validation/reports-integrations.ts', 'utf8');
const expected = [
  'createIntegrationConnectionSchema',
  'createNotificationTemplateSchema',
  'createNotificationSchema',
  'createAuditLogEventSchema'
];
for (const name of expected) {
  if (!source.includes(name)) throw new Error(`Validation schema missing: ${name}`);
}
console.log('Validation test passed.');
