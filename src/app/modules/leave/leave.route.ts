import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { LeaveRequestValidations } from './leave.validation';
import { leaveRequestControllers } from './leave.controller';

const router = express.Router();

router.post(
  '/',
  validateRequest(LeaveRequestValidations.leaveRequestSchema),
  leaveRequestControllers.createLeaveRequest,
);
router.get('/', leaveRequestControllers.getAllLeaveRequests);
router.get('/employeeId', leaveRequestControllers.employeeLeaveRequest);
router.get('/:leaveRequestsId', leaveRequestControllers.getSingleLeaveRequest);
router.delete('/:leaveRequestsId', leaveRequestControllers.deleteLeaveRequest);
router.patch(
  '/:leaveRequestsId',
  validateRequest(LeaveRequestValidations.updateValidationSchema),
  leaveRequestControllers.updateLeaveRequest,
);

export const leaveRequestRoutes = router;
