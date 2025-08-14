
export function getToken() {
  return localStorage.getItem("token");
}
export function isLoggedIn() {
  return !!getToken();
}
export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("roles");
}
