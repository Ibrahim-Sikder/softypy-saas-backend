import { z } from 'zod';

const createWarehouse = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    code: z.string({ required_error: 'Code is required' }),
    type: z.string({ required_error: 'Type is required' }),
    status: z.enum(['active', 'inactive']).optional(),
    address: z.string({ required_error: 'Address is required' }),
    city: z.string({ required_error: 'City is required' }),
    division: z.string({ required_error: 'Division is required' }),
    postalCode: z.string({ required_error: 'Postal code is required' }),
    country: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    manager: z.string({ required_error: 'Manager is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    description: z.string({ required_error: 'Description is required' }),
  }),
});
const updateWarehouse = z.object({
    body: z.object({
      name: z.string().optional(),
      code: z.string().optional(),
      type: z.string().optional(),
      status: z.enum(['active', 'inactive']).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      division: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      manager: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Invalid email format').optional(),
      description: z.string().optional(),
    }),
  });
  export const WarehouseValidations = {
    createWarehouse,
    updateWarehouse,
  };
  