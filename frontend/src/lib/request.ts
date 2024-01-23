type APIType = 'method' | 'document' | 'doctype';

interface APIRequestOptions {
  type: APIType;
  path: string;
}

export async function makeRequest(options: APIRequestOptions) {
  const url = `/api/v2/${options.type}/${options.path}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    console.error('Errors from Frappe API', data.errors);
    throw new Error('Error occurred while fetching data...');
  }

  if (data.data) {
    return data.data;
  }

  return data;
}
