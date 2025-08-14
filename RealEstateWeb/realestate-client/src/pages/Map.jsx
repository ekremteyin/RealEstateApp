
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { listEstates } from "../api/estates";


L.Marker.prototype.options.icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
  return s || "";
}


function FitToAll({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const b = L.latLngBounds(points);
    if (b.isValid()) map.fitBounds(b, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

// Backend: latitude/longitude kullanıyoruz
function normalizeEstate(e) {
  const lat = e?.location?.latitude ?? e?.latitude ?? null;
  const lon = e?.location?.longitude ?? e?.longitude ?? null;
  return {
    id: String(e?.id ?? e?.estateId ?? ""),
    title: e?.title ?? e?.name ?? "İlan",
    type: e?.type ?? "",
    status: e?.status ?? "",
    price: e?.price,
    currency: e?.currency,
    address: e?.address ?? e?.location?.address ?? "",
    thumbnailUrl: e?.photos?.[0]?.imageUrl || "",
    lat: Number(lat),
    lon: Number(lon),
  };
}

export default function MapPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const location = useLocation();

  useEffect(() => {
    let ok = true;
    setErr("");
    listEstates({ _ts: Date.now() })       
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.items ?? d?.data ?? [];
        ok && setRows(list.map(normalizeEstate));
      })
      .catch((e) => ok && setErr(e?.message || "İlanlar alınamadı"));
    return () => { ok = false; };
  }, [location.key, location.search]); 

  const points = useMemo(
    () =>
      rows
        .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon))
        .map((m) => [m.lat, m.lon]),
    [rows]
  );

  const center = points.length ? points[0] : [39.925533, 32.866287];

  return (
    <>
      {err && <div style={{ padding: 12, color: "crimson" }}>Harita verisi yüklenemedi: {err}</div>}

      
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom
        style={{
          position: "fixed",
          top: "var(--nav-h, 56px)",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToAll points={points} />

        {rows.map((m) => {
          if (!Number.isFinite(m.lat) || !Number.isFinite(m.lon)) return null;
          return (
            <Marker key={m.id || `${m.lat},${m.lon}`} position={[m.lat, m.lon]}>
              <Popup>
                <div className="popup-card" style={{ minWidth: 230, maxWidth: 280 }}>
                  {m.thumbnailUrl && (
                    <img
                      src={resolveImg(m.thumbnailUrl)}
                      alt={m.title}
                      style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
                    />
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 700, lineHeight: 1.2, flex: 1 }}>{m.title}</div>
                    {m.price != null && (
                      <div style={{ whiteSpace: "nowrap" }}>
                        {Number(m.price).toLocaleString()} {m.currency ?? ""}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {m.type && <span className="chip">{m.type}</span>}
                    {m.status && <span className="chip chip-status">{statusLabel(m.status)}</span>}
                  </div>

                  {m.address && (
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                      {m.address}
                    </div>
                  )}

                  <Link
                    to={`/estates/${m.id}`}
                    className="btn-mini"
                    style={{ display: "inline-block", marginTop: 10 }}
                  >
                    Detayları Gör
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
