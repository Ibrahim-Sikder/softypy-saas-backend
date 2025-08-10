import { z } from 'zod';

const vehicleValidationSchema = z.object({
  body: z.object({
    carReg_no: z.string({ required_error: 'Car reg no is required.' }),
    car_registration_no: z.string({ required_error: 'Car reg no is required.' }),
    chassis_no: z.string({ required_error: 'Chassis no is required.' }),
    engine_no: z.string().optional(),
    vehicle_brand: z.string().optional(),
    vehicle_name: z.string().optional(),
    vehicle_model: z
      .number()
      .nonnegative().optional(),
    vehicle_category: z.string().optional(),
    color_code: z.string().optional(),
    
  }),
});

export const vehicleValidation = {
  vehicleValidationSchema,
};
