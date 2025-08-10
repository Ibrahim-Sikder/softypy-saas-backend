import { z } from "zod";

const preprocessOptionalString = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().optional()
);

const preprocessOptionalNumber = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().optional()
);

const preprocessOptionalDate = z.preprocess(
  (val) => {
    if (!val || val === "") return undefined;
    const date = new Date(val as string);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  },
  z.string().optional()
);

const createWarehouse = z.object({
  body: z.object({
    name: z.string({ required_error: "Warehouse Name is required" }),
    address: preprocessOptionalString,
    city: preprocessOptionalString,
    manager: preprocessOptionalString,
    phone: preprocessOptionalString,
    type: preprocessOptionalString,
    capacity: preprocessOptionalNumber,
    openingDate: preprocessOptionalDate,
    status: z.enum(["active", "inactive"]).optional(),
    note: preprocessOptionalString,
  }),
});

const updateWarehouse = z.object({
  body: z.object({
    name: preprocessOptionalString,
    address: preprocessOptionalString,
    city: preprocessOptionalString,
    manager: preprocessOptionalString,
    phone: preprocessOptionalString,
    type: preprocessOptionalString,
    capacity: preprocessOptionalNumber,
    openingDate: preprocessOptionalDate,
    status: z.enum(["active", "inactive"]).optional(),
    note: preprocessOptionalString,
  }),
});

export const WarehouseValidations = {
  createWarehouse,
  updateWarehouse,
};
