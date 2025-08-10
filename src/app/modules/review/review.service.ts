/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { Review } from './review.model';
import { TReview } from './review.interface';
import { reviewSearch } from './review.constant';
import AppError from '../../errors/AppError';


const createreview = async (payload: TReview) => {
  const newFaq = await Review.create(payload);
  return newFaq;
};

const getAllreview = async (query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(Review.find(), query)
    .search(reviewSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await reviewQuery.countTotal();
  const reviews = await reviewQuery.modelQuery;

  return {
    meta,
    reviews,
  };
};

const updatereview = async (id: string, payload: Partial<TReview>) => {
  const result = await Review.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deletereview = async (id: string) => {
  const faq = await Review.findByIdAndDelete(id);

  if (!faq) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No faq available');
  }

  return faq;
};
const getSiniglereview = async (id: string) => {
  const result = await Review.findById(id);
  return result;
};

export const reviewServices = {
  createreview,
  getAllreview,
  updatereview,
  deletereview,
  getSiniglereview,
};
