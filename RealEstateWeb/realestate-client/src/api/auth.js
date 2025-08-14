
import api from "./client";


export async function me(tokenOverride) {
  const cfg = tokenOverride
    ? { headers: { Authorization: `Bearer ${tokenOverride}` } }
    : undefined;
  const { data } = await api.get("/Auth/me", cfg);
  return data; 
}

// Login token'ı alır /Auth/me ile rolleri getirir ve döndürür
export async function loginRequest(username, password) {
  const { data } = await api.post("/Auth/login", { username, password });


  const rawToken =
    typeof data === "string"
      ? data
      : data?.token || data?.accessToken || data?.jwt;

  if (!rawToken) throw new Error("Token not found in response");

  
  const token = String(rawToken).replace(/^Bearer\s+/i, "");

  
  let info;
  try {
    info = await me(token);
  } catch {
    info = {};
  }

  
  let roles =
    info?.roles ??
    info?.role ??
    info?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    [];

  roles = Array.isArray(roles) ? roles : [roles].filter(Boolean);

  return { token, roles };
}


export async function registerRequest(username, password) {
  const body = { username, password };
  const { data } = await api.post("/Auth/register", body);
  const token =
    typeof data === "string"
      ? data
      : data?.accessToken || data?.token || data?.jwt || null;

  let roles = data?.roles || [];
  roles = Array.isArray(roles) ? roles : [roles].filter(Boolean);

  return { token, roles, raw: data };
}
