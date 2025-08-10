import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TNote } from './note.interface';
import { getTenantModel } from '../../utils/getTenantModels';
import QueryBuilder from '../../builder/QueryBuilder';

const createNote = async (tenantDomain: string, payload: TNote) => {
  try {


    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof TNote] === '') {
        delete payload[key as keyof TNote];
      }
    });

    const { Model: Note } = await getTenantModel(tenantDomain, 'Note');
    const newNote = await Note.create(payload);
    return newNote;
  } catch (error: any) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'Error creating note'
    );
  }
};

// const getAllNotes = async (tenantDomain: string, query: Record<string, any>) => {
//   const { Model: Note } = await getTenantModel(tenantDomain, 'Note');

//   const noteQuery = new QueryBuilder(Note.find().populate('customerId'), query)
//     .search(['title', 'content'])
//     // .filter()
//     // .sort()
//     .paginate()
//     .fields();

//   const meta = await noteQuery.countTotal();
//   const notes = await noteQuery.modelQuery;

//   return { meta, notes };
// };


const getAllNotes = async (tenantDomain: string, query: Record<string, any>) => {
  const { Model: Note } = await getTenantModel(tenantDomain, 'Note');

  const { customerId, companyId, showRoomId, ...restQuery } = query;

  let baseQuery = Note.find().populate('customerId').populate('companyId').populate('showRoomId');

  const filterConditions: Record<string, any> = {};
  if (customerId) filterConditions.customerId = customerId;
  if (companyId) filterConditions.companyId = companyId;
  if (showRoomId) filterConditions.showRoomId = showRoomId;

  if (Object.keys(filterConditions).length > 0) {
    baseQuery = baseQuery.find(filterConditions);
  }


  const noteQuery = new QueryBuilder(baseQuery, restQuery)
    .search(['title', 'content'])
    // .filter()  // can keep if you have additional filters
    // .sort()
    .paginate()
    .fields();

  const meta = await noteQuery.countTotal();
  const notes = await noteQuery.modelQuery;

  return { meta, notes };
};



const getSingleNote = async (tenantDomain: string, id: string) => {
  const { Model: Note } = await getTenantModel(tenantDomain, 'Note');

  const note = await Note.findById(id).populate('customerId');
  if (!note) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Note not found');
  }

  return note;
};

const updateNote = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TNote>
) => {

  const { Model: Note } = await getTenantModel(tenantDomain, 'Note');

  const updatedNote = await Note.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedNote) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Note not found');
  }

  return updatedNote;
};



const permanentlyDeleteNote = async (tenantDomain: string, id: string) => {
  const { Model: Note } = await getTenantModel(tenantDomain, 'Note');
  const note = await Note.findById(id);

  if (!note) throw new AppError(StatusCodes.NOT_FOUND, 'Note not found');

  await Note.deleteOne({ _id: id });
  return { message: 'Note permanently deleted' };
};

export const noteServices = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  permanentlyDeleteNote,
};
