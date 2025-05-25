// apiClient.ts

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any; // Allow body to be any type, will be JSON.stringified
  isFormData?: boolean; // Flag to indicate if body is FormData
}

interface ApiClientResponse<T> {
  data: T;
  status: number;
  error?: string; // Optional error message for failed requests
}

async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiClientResponse<T>> {
  const { body, isFormData, ...customConfig } = options;
  // Prioritize 'authToken' for customer/general auth, can add logic for 'adminAuthToken' if needed for specific admin calls
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null; 

  const headers: HeadersInit = {
    // 'Content-Type': 'application/json', // Will be set later if not FormData
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customConfig.headers,
  };
  
  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json';
  }


  const config: RequestInit = {
    method: body ? 'POST' : 'GET', // Default to POST if body exists, else GET
    ...customConfig,
    headers,
  };

  if (body) {
    if (isFormData) {
      config.body = body; // Body is already FormData
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(endpoint, config);
    const responseData = await response.json();

    if (!response.ok) {
      // Try to parse error message from response, default to a generic one
      const errorMessage = responseData.message || responseData.error || `API request failed with status ${response.status}`;
      console.error('API Error:', errorMessage, 'Response Data:', responseData);
      return {
        data: responseData as T, // Still return data if any, for potential partial info
        status: response.status,
        error: errorMessage,
      };
    }

    return {
      data: responseData as T,
      status: response.status,
    };

  } catch (error: any) {
    console.error('API Client Fetch Error:', error);
    return {
      data: null as T, // Or some default error object
      status: 0, // Or a specific status code for client-side errors
      error: error.message || 'An unexpected network error occurred.',
    };
  }
}

export default apiClient;

// Example Usage:
// apiClient<{ id: string; name: string; }>('/api/some-resource')
//   .then(response => {
//     if (response.error) { /* handle error */ }
//     else { /* use response.data */ }
//   });

// apiClient('/api/another-resource', { method: 'POST', body: { foo: 'bar' } })
//   .then(/* ... */);
