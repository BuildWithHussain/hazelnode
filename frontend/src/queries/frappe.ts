import { makeRequest } from '@/lib/request';
import { queryOptions, useQuery } from '@tanstack/react-query';

type FilterObject<DT> = Record<
  keyof DT,
  number | string | Array<string | number>
>; // TODO: can be more granular later

export interface DocTypeQueryParams<DT> {
  fields?: Array<keyof DT> | '*';
  filters?: FilterObject<DT>;
  orFilters?: FilterObject<DT>;
  limit?: number;
  limit_start?: number;
  start?: number;
  orderBy?: string;
  groupBy?: string;
  asDict?: boolean;
}

export function useDocType<DT>(doctype: string) {
  const getListQueryOptions = (params: DocTypeQueryParams<DT>) =>
    queryOptions({
      queryKey: [doctype, 'list', params],
      queryFn: () => {
        return makeRequest({
          type: 'document',
          path: doctype,
          params: { ...params, fields: JSON.stringify(params.fields) },
        });
      },
      enabled: !!params,
    });

  const getDocQueryOptions = (name: string) =>
    queryOptions({
      queryKey: [doctype, 'doc', name],
      queryFn: (): Promise<DT> => {
        return makeRequest({
          type: 'document',
          path: `${doctype}/${name}`,
        });
      },
      enabled: !!name,
    });

  return {
    useList: (params: DocTypeQueryParams<DT>) =>
      useQuery(getListQueryOptions(params)),
    useDoc: (name: string) => useQuery(getDocQueryOptions(name)),
  };
}
