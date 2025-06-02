import express from 'express';
import { TenantControllers } from './tenant.controller';
const router = express.Router();

router.post('/', TenantControllers.createTenant);
router.get('/', TenantControllers.getAllTenant);

export const teanentRoute = router;
