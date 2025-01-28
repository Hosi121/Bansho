export async function authenticatedFetch(
    url: string,
    options: RequestInit = {},
    onUnauthorized: () => void
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
      if(onUnauthorized) {
        onUnauthorized();
      }
      throw new Error('認証が切れました');
    }
  
    return response;
  }