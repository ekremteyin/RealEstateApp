
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { token, roles } = await loginRequest(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("roles", JSON.stringify(roles || []));
      nav("/");
    } catch (e) {
      setErr(e?.response?.data || e.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div
      className="auth-page"
      style={{
        position: "fixed",             
        top: "var(--nav-h)",           
        left: 0,
        right: 0,
        bottom: 0,                    
        display: "grid",
        placeItems: "center",          
        padding: 0,
        zIndex: 0                     
      }}
    >
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 480,
          boxSizing: "border-box",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          padding: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,.04)",
        }}
      >
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err && <div style={{ color: "#b91c1c" }}>{String(err)}</div>}
          <button type="submit" disabled={loading} style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            background: "#f8f8f8",
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer"
          }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
