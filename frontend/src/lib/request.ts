type APIType = 'method' | 'document' | 'doctype';

interface APIRequestOptions {
  type: APIType;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: object;
}

export async function makeRequest(options: APIRequestOptions) {
  if (!options.type || !options.path) {
    throw new Error('Invalid request options');
  }

  if (!options.method) {
    options.method = 'GET';
  }

  let url = `/api/v2/${options.type}/${options.path}`;
  let body;

  if (options.params) {
    if (options.method == 'GET') {
      const params = new URLSearchParams(options.params);
      url += '?' + params.toString();
    } else {
      body = JSON.stringify(options.params);
    }
  }

  const response = await fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

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
