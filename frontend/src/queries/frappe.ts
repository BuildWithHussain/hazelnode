import { makeRequest } from '@/lib/request';
import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

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
  or_filters?: FilterObject<DT>;
  limit?: number;
  limit_start?: number;
  start?: number;
  order_by?: string;
  group_by?: string;
  as_dict?: boolean;
}

export function useDocType<DT>(doctype: DocTypeName) {
  return {
    useList: (params: DocTypeQueryParams<DT> = {}) =>
      useQuery(getListQueryOptions<DT>(doctype, params)),
    getListOptions: (params: DocTypeQueryParams<DT> = {}) =>
      getListQueryOptions<DT>(doctype, params),
    getDocOptions: (name: string) => getDocQueryOptions<DT>(doctype, name),
    useDoc: (name: string) => useQuery(getDocQueryOptions<DT>(doctype, name)),
    useSetValueMutation: () => useSetValueMutation<DT>(doctype),
    useCreateDocMutation: () => useCreateDocMutation<DT>(doctype),
    useSuspenseDoc: (name: string) =>
      useSuspenseQuery(getDocQueryOptions<DT>(doctype, name)),
    useDeleteDocMutation: () => useDeleteDocMutation(doctype),
  };
}

export function getListQueryOptions<DT>(
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

export function getDocQueryOptions<DT>(doctype: DocTypeName, name: string) {
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

interface SetValueData<DT> {
  name: string;
  values: Partial<DT>;
}

export function useSetValueMutation<DT>(doctype: DocTypeName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetValueData<DT>) => {
      return makeRequest({
        type: 'method',
        path: 'frappe.client.set_value',
        method: 'POST',
        params: {
          doctype,
          name: data.name,
          fieldname: data.values,
        },
      });
    },
    onSuccess(_, variables: SetValueData<DT>) {
      // invalidate the list and doc queries
      queryClient.invalidateQueries({
        queryKey: [doctype, 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: [doctype, 'doc', variables.name],
      });
    },
  });
}

export function useCreateDocMutation<DT>(doctype: DocTypeName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doc: Partial<DT>): Promise<DT> => {
      return makeRequest({
        method: 'POST',
        type: 'document',
        path: doctype,
        params: doc,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [doctype, 'list'],
      });
    },
  });
}

export function useDeleteDocMutation(doctype: DocTypeName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { name: string }) => {
      return makeRequest({
        type: 'document',
        method: 'DELETE',
        path: `${doctype}/${variables.name}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [doctype, 'list'],
      });
    },
  });
}
