import { z } from 'zod';

const vehicleValidationSchema = z.object({
  body: z.object({
    carReg_no: z.string({ required_error: 'Car reg no is required.' }),
    car_registration_no: z.string({
      required_error: 'Car registration no is required.',
    }),
    chassis_no: z.string({ required_error: 'Chassis no is required.' }),
    engine_no: z.string({ required_error: 'Engine no is required.' }),
    vehicle_brand: z.string({ required_error: 'Vehicle brand is required.' }),
    vehicle_name: z.string({ required_error: 'Vehicle name is required.' }),
    vehicle_model: z
      .number({ required_error: 'Vehicle brand is required.' })
      .nonnegative({ message: 'Vehicle model is required.' }),
    vehicle_category: z.string({
      required_error: 'Vehicle category is required.',
    }),
    color_code: z.string({ required_error: 'Color & code is required.' }),
    
  }),
});

export const vehicleValidation = {
  vehicleValidationSchema,
};
