// Auth service utilities
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const storeAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};