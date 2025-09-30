import { Document, Model } from 'mongoose';

export interface IPage {
  name: string;
  category: string;
  path: string;
  description?: string;
  status: 'active' | 'inactive';
}



export interface IPageFilters {
  searchTerm?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}