import { z } from 'zod';

const uuid = z.string().uuid();

export const createIntegrationConnectionSchema = z.object({
  tenant_id: uuid,
  provider: z.enum(['stripe','square','twilio','sendgrid','quickbooks']),
  status: z.enum(['not_configured','configured','disabled','error']).default('not_configured'),
  public_config: z.union([z.string(), z.record(z.unknown())]).default({}),
  secret_ref: z.string().trim().max(300).optional().or(z.literal(''))
});

export const updateIntegrationConnectionSchema = createIntegrationConnectionSchema.partial().extend({
  id: uuid.optional()
});

export const createNotificationTemplateSchema = z.object({
  tenant_id: uuid,
  name: z.string().trim().min(2).max(160),
  channel: z.enum(['email','sms','in_app']),
  subject_template: z.string().trim().max(300).optional().or(z.literal('')),
  body_template: z.string().trim().min(1).max(5000),
  active: z.coerce.boolean().default(true)
});

export const createNotificationSchema = z.object({
  tenant_id: uuid,
  channel: z.enum(['email','sms','in_app']),
  recipient: z.string().trim().min(2).max(300),
  subject: z.string().trim().max(300).optional().or(z.literal('')),
  body: z.string().trim().min(1).max(5000),
  status: z.enum(['queued','sent','failed','cancelled']).default('queued'),
  provider: z.enum(['stripe','square','twilio','sendgrid','quickbooks']).optional().nullable()
});

export const createAuditLogEventSchema = z.object({
  tenant_id: uuid,
  actor_email: z.string().trim().email().optional().or(z.literal('')),
  action: z.string().trim().min(2).max(200),
  entity_type: z.string().trim().max(120).optional().or(z.literal('')),
  entity_id: uuid.optional().or(z.literal('')),
  before_data: z.union([z.string(), z.record(z.unknown())]).optional(),
  after_data: z.union([z.string(), z.record(z.unknown())]).optional()
});
