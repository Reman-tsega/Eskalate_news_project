export type BaseApiResponse<T> = {
  Success: boolean;
  Message: string;
  Object: T | null;
  Errors: string[] | null;
};

export type PaginatedApiResponse<T> = {
  Success: boolean;
  Message: string;
  Object: T[];
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
  Errors: null;
};

export const responseUtil = {
  success: <T>(message: string, object: T): BaseApiResponse<T> => ({
    Success: true,
    Message: message,
    Object: object,
    Errors: null,
  }),

  error: (message: string, _statusCode = 400, errors: string[] | null = null): BaseApiResponse<null> => ({
    Success: false,
    Message: message,
    Object: null,
    Errors: errors,
  }),

  paginated: <T>(
    message: string,
    object: T[],
    pageNumber: number,
    pageSize: number,
    totalSize: number,
  ): PaginatedApiResponse<T> => ({
    Success: true,
    Message: message,
    Object: object,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: null,
  }),
};
