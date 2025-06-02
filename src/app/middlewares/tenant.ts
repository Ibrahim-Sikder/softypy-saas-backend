import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../modules/tenant/tenant.model';
import { connectToTenantDatabase } from '../../server';

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const domain = req.headers['x-tenant-domain'] as string;

  if (!domain) {
    return res.status(400).json({ error: 'Tenant domain is required' });
  }

  const tenant = await Tenant.findOne({ domain });

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  if (!tenant.isActive) {
    return res.status(403).json({ error: 'Tenant is not active' });
  }

  await connectToTenantDatabase(tenant._id!.toString(), tenant.dbUri);

  (req as any).tenantId = tenant._id;
  next();
};
