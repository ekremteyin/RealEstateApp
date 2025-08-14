
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest, loginRequest } from "../api/auth";

export default function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (password !== confirm) {
      setErr("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const { token } = await registerRequest(username, password);
      let jwt = token;
      if (!jwt) {
        const res = await loginRequest(username, password);
        jwt = res.token;
      }
      localStorage.setItem("token", jwt);
      nav("/");
    } catch (e) {
      const d = e?.response?.data;
      let msg = d?.description || d?.title || e.message || "Register failed";
      if (Array.isArray(d?.errors) && d.errors.length)
        msg = d.errors.map(x => x.description || x.code).join("\n");
      if (d?.code === "DuplicateUserName") msg = "Bu kullanıcı adı zaten kayıtlı.";
      setErr(msg);
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
      }}
    >
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
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
          <input
            placeholder="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {err && <div className="auth-error">{String(err)}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
