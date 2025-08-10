
/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../builder/QueryBuilder';
import { TContact } from './contact.interface';
import { Contact } from './contact.model';


const createContact = async (payload: TContact) => {
  const result = await Contact.create(payload);
  return result;
};

const getAllContact = async (query: Record<string, unknown>) => {
  const contactQuery = new QueryBuilder(Contact.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await contactQuery.countTotal();
  const users = await contactQuery.modelQuery;

  return {
    meta,
    users,
  };
};



const deleteContact = async (id: string) => {
  const result = await Contact.deleteOne({ _id: id });

  return result;
};

export const contactServices = {
  createContact,
  getAllContact,
  deleteContact,
};
