const apiUrl = import.meta.env.VITE_API_URL;

export const protectedFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  let response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
    credentials: 'include',
  });

  if (response.status === 401) {
    const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (refreshResponse.ok) {
      const result = await refreshResponse.json();
      const newToken =
        result.data?.accessToken || result.data?.token || result.accessToken;

      if (newToken) {
        localStorage.setItem('token', newToken);
      }

      return await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${newToken}`,
        },
        credentials: 'include',
      });
    } else {
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
