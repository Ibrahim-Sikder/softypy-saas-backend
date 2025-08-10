
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { contactServices } from './contact.service';
import sendResponse from '../utils/sendResponse';

const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactServices.createContact(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Contact create succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const getAllContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contactServices.getAllContact(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Contact  information retreive succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await contactServices.deleteContact(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Contact deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};



export const contactControllers = {
  getAllContact,
  deleteContact,
   createContact,
};
