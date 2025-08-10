import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { noteServices } from './note.service';

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantDomain } = req.body;
    const newNote = await noteServices.createNote(tenantDomain, req.body);

    return sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Note created successfully',
      data: newNote,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDomain =
      (req.headers['x-tenant-domain'] as string) ||
      (req.query.tenantDomain as string) ||
      req.headers.host ||
      '';

    const notes = await noteServices.getAllNotes(tenantDomain, req.query);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDomain = req.query.tenantDomain as string;
    const { id } = req.params;
    const note = await noteServices.getSingleNote(tenantDomain, id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Note retrieved successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const tenantDomain = req.query.tenantDomain as string;
    const { id } = req.params;
    const updatedNote = await noteServices.updateNote(tenantDomain, id, req.body);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Note updated successfully',
      data: updatedNote,
    });
  } catch (error) {
    next(error);
  }
};





export const permanentlyDeleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDomain = req.query.tenantDomain as string;
    const { id } = req.params;
    const result = await noteServices.permanentlyDeleteNote(tenantDomain, id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const noteController = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  permanentlyDeleteNote,
};
