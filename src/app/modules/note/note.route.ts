import { Router } from 'express';
import { noteController } from './note.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  createNoteValidationSchema,
  updateNoteValidationSchema,
} from './note.validation';

const router = Router();

router.post('/', validateRequest(createNoteValidationSchema), noteController.createNote);
router.get('/', noteController.getAllNotes);
router.get('/:id', noteController.getSingleNote);
router.patch('/:id', validateRequest(updateNoteValidationSchema), noteController.updateNote);
router.delete('/:id', noteController.permanentlyDeleteNote);

export const noteRoutes = router;
