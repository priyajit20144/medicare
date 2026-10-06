import { Request } from 'express';
import { AuditLog } from '../models/AuditLog';

export interface AuditOptions {
  req?: Request;
  actorId?: any;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export async function logAudit(options: AuditOptions): Promise<void> {
  try {
    const actorId = options.actorId || (options.req as any)?.user?._id;
    const actorEmail = options.actorEmail || (options.req as any)?.user?.email;
    const actorRole = options.actorRole || (options.req as any)?.user?.role;
    const ipAddress = options.req ? (options.req.headers['x-forwarded-for'] as string) || options.req.socket.remoteAddress : undefined;
    const userAgent = options.req ? options.req.headers['user-agent'] : undefined;

    // Filter out sensitive data from metadata
    const safeMetadata = options.metadata ? { ...options.metadata } : undefined;
    if (safeMetadata) {
      delete safeMetadata.password;
      delete safeMetadata.token;
      delete safeMetadata.jwt;
      delete safeMetadata.secret;
    }

    await AuditLog.create({
      actorId,
      actorEmail,
      actorRole,
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      metadata: safeMetadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Non-blocking: fail quietly in background so main transaction isn't broken
    console.error('[AuditLog Error]', err);
  }
}
