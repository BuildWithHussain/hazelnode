import { makeRequest } from '@/lib/request';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const options = queryOptions({
  queryKey: ['user-info'],
  queryFn: () => makeRequest('hazelnode.api.get_current_user_info'),
});

export function useUserInfo() {
  return useQuery(options);
}
