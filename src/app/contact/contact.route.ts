import express from 'express';
import { contactControllers } from './contact.controller';

const router = express.Router();

router.post(
  '/',
  contactControllers.createContact,
);
router.get('/', contactControllers.getAllContact);
router.delete('/:id', contactControllers.deleteContact);

export const contactRoutes = router;
