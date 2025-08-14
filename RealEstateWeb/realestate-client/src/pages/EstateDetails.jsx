
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEstateById } from "../api/estates";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "";

function resolveImg(u) {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return u;
}
function statusLabel(s) {
  if (s === "Satilik") return "For Sale";
  if (s === "Kiralik") return "For Rent";
  return s;
}
function formatMoney(v, c) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(v ?? 0);
  } catch {
    return `${Number(v ?? 0).toLocaleString()} ${c || ""}`;
  }
}

export default function EstateDetails() {
  const { id } = useParams();
  const [estate, setEstate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErr(null);
    getEstateById(id)
      .then((data) => live && setEstate(data))
      .catch((e) => live && setErr(e?.response?.data || e.message || "Error"))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [id]);

  const images = useMemo(() => {
    const arr = estate?.photos || [];
    return arr.map((p) => resolveImg(p?.imageUrl)).filter(Boolean);
  }, [estate]);

  const canPrev = idx > 0;
  const canNext = idx < Math.max(0, images.length - 1);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (err) return <div style={{ padding: 20, color: "crimson" }}>{String(err)}</div>;
  if (!estate) return null;

  const lat = estate?.location?.latitude;
  const lon = estate?.location?.longitude;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>{estate.title || `${estate.type} • ${statusLabel(estate.status)}`}</h1>
        <Link to="/" style={{ textDecoration: "none", border: "1px solid #e5e7eb", padding: "6px 12px", borderRadius: 8 }}>
          ← Back to list
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Galeri */}
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          {images.length ? (
            <>
              <div style={{ position: "relative", height: 420, borderRadius: 10, overflow: "hidden" }}>
                <img src={images[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => setIdx((i) => (i > 0 ? i - 1 : i))}
                  disabled={!canPrev}
                  style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
                           padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff",
                           opacity: canPrev ? 1 : 0.5 }}
                >‹</button>
                <button
                  onClick={() => setIdx((i) => (i < images.length - 1 ? i + 1 : i))}
                  disabled={!canNext}
                  style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)",
                           padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff",
                           opacity: canNext ? 1 : 0.5 }}
                >›</button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    style={{ border: i === idx ? "2px solid #111" : "1px solid #e5e7eb",
                             borderRadius: 8, padding: 0, width: 92, height: 64, overflow: "hidden",
                             flex: "0 0 auto", cursor: "pointer", background: "#fff" }}
                    title={`Photo ${i + 1}`}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 420, display: "grid", placeItems: "center", color: "#999" }}>No photos</div>
          )}
        </div>

        
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 6, color: "#555" }}>{estate.type} • {statusLabel(estate.status)}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            {formatMoney(estate.price, estate.currency)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 6, columnGap: 8 }}>
            <div className="label">Start</div><div>{new Date(estate.startDate).toLocaleDateString()}</div>
            <div className="label">End</div><div>{new Date(estate.endDate).toLocaleDateString()}</div>
            <div className="label">Country</div><div>{estate.location?.country}</div>
            <div className="label">City</div><div>{estate.location?.city}</div>
            <div className="label">District</div><div>{estate.location?.district}</div>
            <div className="label">Address</div><div>{estate.location?.addressDetail}</div>
           
          </div>

          
          {Number.isFinite(lat) && Number.isFinite(lon) && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <a
                href={`https://www.google.com/maps/?q=${lat},${lon}`}
                target="_blank" rel="noreferrer"
                style={{ border: "1px solid #e5e7eb", padding: "6px 10px", borderRadius: 8, textDecoration: "none" }}
              >
                Open in Maps
              </a>
            </div>
          )}
        </div>
      </div>

      {estate.description && (
        <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Description</h3>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{estate.description}</p>
        </div>
      )}
    </div>
  );
}
