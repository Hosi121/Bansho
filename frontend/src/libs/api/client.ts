export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証が必要です');
    }
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('認証が切れました');
    }
  
    return response;
  }