import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import { seedDefaultCompanyProfile } from './app/modules/companyProfile/seedDefaultCompanyProfile';
import { User } from './app/modules/user/user.model';
import { Tenant } from './app/modules/tenant/tenant.model';
import { seedSuperAdmin } from './app/modules/user/user.utils';

const tenantConnections: Record<string, mongoose.Connection> = {};

export const connectToCentralDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to Central DB');
  }
};

export const connectToTenantDatabase = async (
  tenantId: string,
  dbUri: string,
) => {
  if (tenantConnections[tenantId]) {
    return tenantConnections[tenantId];
  }

  const connection = await mongoose.createConnection(dbUri).asPromise();
  tenantConnections[tenantId] = connection;
  console.log(`✅ Connected to tenant ${tenantId}`);
  return connection;
};

const startServer = async () => {
  try {
    await connectToCentralDatabase();
    await seedSuperAdmin();

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
