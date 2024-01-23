type APIType = 'method' | 'document' | 'doctype';

interface APIRequestOptions {
  type: APIType;
  path: string;
  params?: object;
}

export async function makeRequest(options: APIRequestOptions) {
  if (!options.type || !options.path) {
    throw new Error('Invalid request options');
  }

  let url = `/api/v2/${options.type}/${options.path}`;

  if (options.params) {
    const params = new URLSearchParams(options.params);
    url += '?' + params.toString();
  }

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
