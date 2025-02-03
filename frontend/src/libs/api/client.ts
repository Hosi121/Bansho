export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  onUnauthorized: () => void
) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('認証が必要です');
  }

  const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    console.log('Request headers:', headers);
  
    const response = await fetch(url, {
      ...options,
      headers: headers
    });

  if (response.status === 401) {
    if(onUnauthorized) {
      onUnauthorized();
    }
    throw new Error('認証が切れました');
  }

  if (!response.ok) {
      console.error(`APIリクエスト失敗: ${response.status} ${response.statusText}`);
  }

  return response;
}