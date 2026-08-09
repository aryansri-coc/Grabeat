const API_BASE_URL = 'http://localhost:5000/api/v1';

export function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('cu_grab_eats_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; errors?: any[] }> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  // If the body is FormData (e.g. for uploads), don't set Content-Type header manually
  if (options.body instanceof FormData) {
    // @ts-ignore
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Something went wrong',
        errors: data.errors || [],
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to connect to the server',
      errors: [],
    };
  }
}
