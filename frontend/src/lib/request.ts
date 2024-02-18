type APIType = 'method' | 'document' | 'doctype';

interface APIRequestOptions {
  type: APIType;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: object;
}

interface FrappeException {
  exception: string;
  indicator: 'red';
  message: string;
  title: string;
  type: string;
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
    const errors = data.errors as FrappeException[];
    const errorMessage = errors.map((e) => e.message).join(',');
    throw new Error(errorMessage);
  }

  if (data.data) {
    return data.data;
  }

  return data;
}
