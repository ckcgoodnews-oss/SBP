const fs = require('fs');
const sql = fs.readFileSync('sql/060_reports_integrations.sql', 'utf8');

const requiredTables = ['integration_connections','notification_templates','notifications'];
for (const table of requiredTables) {
  if (!sql.includes(`create table if not exists ${table}`)) {
    throw new Error(`Reports/integrations schema missing table: ${table}`);
  }
}

const requiredViews = [
  'report_monthly_revenue',
  'report_job_counts_by_status',
  'report_technician_productivity',
  'report_inventory_reorder',
  'report_customer_retention',
  'report_executive_dashboard'
];

for (const view of requiredViews) {
  if (!sql.includes(`view ${view}`)) throw new Error(`Reports schema missing view: ${view}`);
}

console.log('Reports/integrations schema test passed.');
