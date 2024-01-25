import { makeRequest } from '@/lib/request';
import { queryOptions, useQuery } from '@tanstack/react-query';

type FilterObject<DT> = Record<
  keyof DT,
  number | string | Array<string | number>
>; // TODO: can be more granular later

type DocTypeName =
  | 'Hazel Node'
  | 'Hazel Workflow'
  | 'Hazel Node Type'
  | 'Hazel Workflow Execution Log';

export interface DocTypeQueryParams<DT> {
  fields?: ReadonlyArray<keyof DT> | '*';
  filters?: FilterObject<DT>;
  orFilters?: FilterObject<DT>;
  limit?: number;
  limit_start?: number;
  start?: number;
  orderBy?: string;
  groupBy?: string;
  asDict?: boolean;
}

export function useDocType<DT>(doctype: DocTypeName) {
  return {
    useList: (params: DocTypeQueryParams<DT> = {}) =>
      useQuery(getListQueryOptions<DT>(doctype, params)),
    useDoc: (name: string) => useQuery(getDocQueryOptions<DT>(doctype, name)),
  };
}

function getListQueryOptions<DT>(
  doctype: string,
  params: DocTypeQueryParams<DT>,
) {
  if (!params.fields) {
    params.fields = ['name' as keyof DT];
  }
  return queryOptions({
    queryKey: [doctype, 'list', params],
    queryFn: (): Promise<Array<DT>> => {
      return makeRequest({
        type: 'document',
        path: doctype,
        params: { ...params, fields: JSON.stringify(params.fields) },
      });
    },
    enabled: !!params,
  });
}

function getDocQueryOptions<DT>(doctype: DocTypeName, name: string) {
  return queryOptions({
    queryKey: [doctype, 'doc', name],
    queryFn: (): Promise<DT> => {
      return makeRequest({
        type: 'document',
        path: `${doctype}/${name}`,
      });
    },
    enabled: !!name,
  });
}

export function useDocument<DT>(doctype: DocTypeName, name: string) {
  return useQuery(getDocQueryOptions<DT>(doctype, name));
}

export function useDocumentList<DT>(
  doctype: string,
  params: DocTypeQueryParams<DT> = {},
) {
  return useQuery(getListQueryOptions<DT>(doctype, params));
}
