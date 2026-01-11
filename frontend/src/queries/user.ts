import { useFrappeGetCall } from 'frappe-react-sdk';

interface UserInfo {
  full_name: string;
  user_image: string;
}

export function useUserInfo() {
  return useFrappeGetCall<{ message: UserInfo }>(
    'hazelnode.api.get_current_user_info'
  );
}
