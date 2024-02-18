import { makeRequest } from '@/lib/request';
import { queryOptions, useQuery } from '@tanstack/react-query';

interface UserInfo {
  full_name: string;
  user_image: string;
}

export const options = queryOptions({
  queryKey: ['user-info'],
  queryFn: (): Promise<UserInfo> =>
    makeRequest({
      type: 'method',
      path: 'hazelnode.api.get_current_user_info',
    }),
});

export function useUserInfo() {
  return useQuery(options);
}
