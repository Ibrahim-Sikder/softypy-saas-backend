
export interface IPage {
  name: string;
  path: string;
  route: string;
  status: 'active' | 'inactive';
}

export interface IPageFilters {
  searchTerm?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}