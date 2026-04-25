// save login
export const loginUser = () => {
  localStorage.setItem("token", "dummy-token");
};

// logout
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// check login
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};
