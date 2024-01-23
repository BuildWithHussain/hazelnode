type APIType = 'method' | 'document' | 'doctype';

export async function makeRequest(type: APIType, path: string) {
  const url = `/api/v2/${type}/${path}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error occurred while fetching user info');
  }

  const data = await response.json();

  if (data.message) {
    return data.message;
  }

  return data;
}
