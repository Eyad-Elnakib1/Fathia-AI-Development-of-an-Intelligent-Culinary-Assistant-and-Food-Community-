// Get user info from localStorage
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Check if user is logged in
export const isAuthenticated = () => {
  const userInfo = getUserInfo();
  return userInfo && userInfo.token ? true : false;
};

// Get auth token
export const getToken = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.token : null;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
};

// Get auth header
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
