import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import { holidayControllers } from './holiday.controller';
import {
  HolidayValidationSchema,
  updateValidationSchema,
} from './holiday.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(HolidayValidationSchema),
  holidayControllers.createHoliday,
);

router.get('/', holidayControllers.getAllHolidays);

router.get('/:holidayId', holidayControllers.getSingleHoliday);

router.patch(
  '/:holidayId',
  validateRequest(updateValidationSchema),
  holidayControllers.updateHoliday,
);

router.delete('/:holidayId', holidayControllers.deleteHoliday);

export const holidayRoutes = router;
