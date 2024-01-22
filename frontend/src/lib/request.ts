export async function makeRequest(api: string) {
  const response = await fetch(`/api/method/${api}`);
  if (!response.ok) {
    throw new Error('Error occurred while fetching user info');
  }

  const data = await response.json();

  if (data.message) {
    return data.message;
  }

  return data;
}
