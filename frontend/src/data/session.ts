export function getSessionUserId() {
  const cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
  let _sessionUser = cookies.get("user_id");
  if (_sessionUser === "Guest") {
    _sessionUser = null;
  }
  return _sessionUser;
}

export async function getUserInfo() {
  const response = await fetch(
    "/api/method/hazelnode.api.get_current_user_info"
  );
  if (!response.ok) {
    throw new Error("Error occurred while fetching user info");
  }
  const data = await response.json();

  if (data.message) {
    return data.message;
  }

  return data;
}
