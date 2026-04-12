const apiUrl = import.meta.env.VITE_API_URL;

export const protectedFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  console.log(`[API] REQUEST: ${options.method || 'GET'} ${endpoint}`);
  console.log(`[API] Token exists: ${!!token}`);
  console.log(
    `[API] RefreshToken exists: ${!!localStorage.getItem('refreshToken')}`,
  );

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  let response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  });

  console.log(`[API] RESPONSE: ${response.status} for ${endpoint}`);

  if (response.status === 401) {
    console.warn(`[API] 401 received — attempting token refresh...`);

    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!storedRefreshToken) {
      console.error(`[API] No refresh token found — logging out immediately`);
      const role = localStorage.getItem('role');
      localStorage.clear();
      if (role === 'admin') window.location.href = '/login-admin';
      else if (role === 'patient') window.location.href = '/login-patient';
      else if (role === 'doctor') window.location.href = '/login-doctor';
      else window.location.href = '/login-staff';
      return response;
    }

    console.log(`[API] Refresh token found — calling refresh endpoint...`);

    const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    console.log(`[API] Refresh response status: ${refreshResponse.status}`);

    if (refreshResponse.ok) {
      const result = await refreshResponse.json();
      console.log(`[API] Refresh SUCCESS — new token received`);
      localStorage.setItem('token', result.data.accessToken);
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
        console.log(`[API] New refresh token also stored`);
      }
      return await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${result.data.accessToken}`,
        },
      });
    } else {
      console.error(
        `[API] Refresh FAILED (${refreshResponse.status}) — logging out`,
      );
      const role = localStorage.getItem('role');
      localStorage.clear();
      if (role === 'admin') window.location.href = '/login-admin';
      else if (role === 'patient') window.location.href = '/login-patient';
      else if (role === 'doctor') window.location.href = '/login-doctor';
      else window.location.href = '/login-staff';
      return response;
    }
  }

  return response;
};
