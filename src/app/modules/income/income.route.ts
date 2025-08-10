import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { createIncomeValidationSchema } from "./income.validation";
import { incomeControllers } from "./income.controller";

const router = express.Router();
router
  .route("/")
  .post(validateRequest(createIncomeValidationSchema), incomeControllers.createIncome)
  .get(incomeControllers.getAllIncome);

router
  .route("/:id")
  .get(incomeControllers.getSingleIncome)
  .put(incomeControllers.updateIncome)
  .delete(incomeControllers.deleteIncome);


export const IncomeRoutes = router;
