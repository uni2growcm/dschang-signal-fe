import { userApi } from '../services';

export interface PaginatedUsers {
  users: any[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}

export const getAllUsersPaginated = async (params: {
  page: number;
  size: number;
  sort?: string;
}): Promise<PaginatedUsers> => {
  const rawResponse = await userApi.getAllUsersRaw({
    page: params.page,
    size: params.size,
    sort: params.sort,
  });

  const headers = rawResponse.raw.headers;
  const totalCount = Number(headers.get('X-Total-Count') ?? 0);
  const pageSize = Number(headers.get('X-Page-Size') ?? params.size);
  const pageNumber = Number(headers.get('X-Page-Number') ?? params.page);
  const totalPages = Math.ceil(totalCount / pageSize);

  const users = await rawResponse.value();

  console.log('X-Total-Count:', headers.get('X-Total-Count'));
  console.log('totalCount:', totalCount);
  console.log('totalPages:', totalPages);

  return { users, totalCount, totalPages, pageNumber };
};
