
import React, { useState, useEffect } from "react";
import "../styles/estate-form.css";
import { createEstate } from "../api/estates";
import { uploadPhoto } from "../api/photos";
import { useNavigate } from "react-router-dom";


const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const TYPES = ["Villa", "Apartment", "Land"];
const STATUSES = [
  { value: "Satilik", label: "For Sale" },
  { value: "Kiralik", label: "For Rent" },
];
const CURRENCIES = ["TRY", "USD", "EUR"];

export default function EstateForm({ mode = "create" }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const plus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    type: "",
    status: "",
    currency: "",
    price: "",
    startDate: today,
    endDate: plus30,
    description: "",
    location: {
      country: "Türkiye",
      city: "",
      district: "",
      addressDetail: "",
      latitude: "",
      longitude: "",
    },
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setLoc = (k, v) =>
    setForm((s) => ({ ...s, location: { ...s.location, [k]: v } }));

  const fullAddress = () => {
    const { country, city, district, addressDetail } = form.location || {};
    return [addressDetail, district, city, country].filter(Boolean).join(", ");
  };

  
  async function getBiasCenter(country, city, district) {
    const placeQuery = [district, city, country].filter(Boolean).join(", ");

    
    if (MAPTILER_KEY) {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        placeQuery
      )}.json?key=${MAPTILER_KEY}&types=place,locality,neighborhood,region&language=tr&country=tr&limit=1`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const first = data?.features?.[0];
          if (first?.center) {
            const [lon, lat] = first.center;
            return { lat, lon };
          }
        }
      } catch {}
    }

    
    try {
      const p = new URLSearchParams({
        format: "json",
        limit: "1",
        "accept-language": "tr",
        countrycodes: "tr",
      });
      if (district) p.set("city", district); // ilçe
      if (city) p.set("state", city); // il
      if (country) p.set("country", country);
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?${p.toString()}`
      );
      if (r.ok) {
        const d = await r.json();
        const first = d?.[0];
        if (first?.lat && first?.lon) return { lat: +first.lat, lon: +first.lon };
      }
    } catch {}
    return null;
  }

  
  async function geocodeWithMapTiler(q, bias /* {lat,lon} | null */) {
    if (!MAPTILER_KEY) return null;
    const params = new URLSearchParams({
      key: MAPTILER_KEY,
      limit: "1",
      language: "tr",
      country: "tr",
      types: "address,street",
      autocomplete: "false",
    });
    if (bias) params.set("proximity", `${bias.lon},${bias.lat}`);
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      q
    )}.json?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const first = data?.features?.[0];
      if (!first?.center) return null;
      const [lon, lat] = first.center;
      return { lat, lon };
    } catch {
      return null;
    }
  }

  
  async function geocodeWithOSMStructured(
    addr /* {addressDetail,district,city,country} */,
    bias /* {lat,lon}|null */
  ) {
    const p = new URLSearchParams({
      format: "json",
      limit: "1",
      addressdetails: "1",
      "accept-language": "tr",
      countrycodes: "tr",
    });
    if (addr.addressDetail) p.set("street", addr.addressDetail);
    if (addr.district) p.set("county", addr.district); // TR: ilçe
    if (addr.city) p.set("state", addr.city); // TR: il
    if (addr.country) p.set("country", addr.country);

    if (bias) {
      
      const dLat = 0.18;
      const dLon = 0.22;
      const left = (bias.lon - dLon).toFixed(6);
      const right = (bias.lon + dLon).toFixed(6);
      const top = (bias.lat + dLat).toFixed(6);
      const bottom = (bias.lat - dLat).toFixed(6);
      p.set("viewbox", `${left},${top},${right},${bottom}`);
      p.set("bounded", "1");
    }

    const url = `https://nominatim.openstreetmap.org/search?${p.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const first = data?.[0];
      if (!first?.lat || !first?.lon) return null;
      return { lat: Number(first.lat), lon: Number(first.lon) };
    } catch {
      return null;
    }
  }

  
  async function tryGeocodeSilently() {
    const q = fullAddress();
    if (!q) return null;

    try {
      setGeocoding(true);

      
      const bias = await getBiasCenter(
        form.location.country,
        form.location.city,
        form.location.district
      );

      
      let coords = await geocodeWithMapTiler(q, bias);

      
      if (!coords) {
        coords = await geocodeWithOSMStructured(
          {
            addressDetail: form.location.addressDetail,
            district: form.location.district,
            city: form.location.city,
            country: form.location.country,
          },
          bias
        );
      }

      if (!coords) return null;

      setLoc("latitude", Number(coords.lat).toFixed(6));
      setLoc("longitude", Number(coords.lon).toFixed(6));
      return coords;
    } finally {
      setGeocoding(false);
    }
  }

  
  useEffect(() => {
    const q = fullAddress();
    if (!q || q.length < 8) return;
    const t = setTimeout(() => {
      if (!form.location.latitude || !form.location.longitude) {
        tryGeocodeSilently();
      }
    }, 600);
    return () => clearTimeout(t);
    
  }, [
    form.location.addressDetail,
    form.location.district,
    form.location.city,
    form.location.country,
  ]);

  
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      
      if (!form.location.latitude || !form.location.longitude) {
        await tryGeocodeSilently();
      }

      const latVal =
        form.location.latitude !== "" ? Number(form.location.latitude) : null;
      const lonVal =
        form.location.longitude !== "" ? Number(form.location.longitude) : null;

      const payload = {
        title: form.title,
        type: form.type,
        status: form.status,
        currency: form.currency,
        price:
        typeof form.price === "string"
          ? Number(form.price.replace(/\./g, "").replace(",", "."))
          : Number(form.price ?? 0),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        description: form.description || null,
        location: {
          country: form.location.country,
          city: form.location.city,
          district: form.location.district,
          addressDetail: form.location.addressDetail,
          latitude: latVal,
          longitude: lonVal,
        },
      };

      const created = await createEstate(payload);
      const newId = created?.id ?? created?.Id;

      // Fotoğrafları yükler
      if (newId && selectedFiles.length) {
        for (const file of selectedFiles) {
          try {
            await uploadPhoto(Number(newId), file);
          } catch {}
        }
      }

      navigate("/");
    } catch (e2) {
      setError(e2?.response?.data || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="est-shell">
      <header className="est-topbar">
        <div className="brand">EstateFlow</div>
      </header>

      <main className="est-container">
        <h1 className="est-title">
          {mode === "create" ? "Create Estate" : "Edit Estate"}
        </h1>

        <form className="est-card" onSubmit={handleSubmit}>
          
          <div className="est-grid-2">
            <div className="est-field">
              <label>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Title"
              />
            </div>

            <div className="est-field">
              <label>Type *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="">Select Property Type</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="est-field">
              <label>Status *</label>
              <select
                required
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="">Select Status</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="est-field">
              <label>Currency *</label>
              <select
                required
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
              >
                <option value="">Select Currency</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="est-field">
              <label>Price *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="Enter Price"
              />
            </div>

            <div className="est-field">
              <label>Start Date *</label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>

            <div className="est-field">
              <label>End Date *</label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Adres */}
          <div className="est-grid-3">
            <div className="est-field">
              <label>Country</label>
              <input
                value={form.location.country}
                onChange={(e) => setLoc("country", e.target.value)}
              />
            </div>
            <div className="est-field">
              <label>City</label>
              <input
                value={form.location.city}
                onChange={(e) => setLoc("city", e.target.value)}
              />
            </div>
            <div className="est-field">
              <label>District</label>
              <input
                value={form.location.district}
                onChange={(e) => setLoc("district", e.target.value)}
              />
            </div>
          </div>

          <div className="est-field">
            <label>Address Detail</label>
            <input
              value={form.location.addressDetail}
              onChange={(e) => setLoc("addressDetail", e.target.value)}
              placeholder="Sokak, No, Mahalle…"
            />
          </div>

          {/* Fotoğraflar */}
          <div className="est-field">
            <label>Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            {!!selectedFiles.length && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      border: "1px solid #eee",
                      padding: "4px 8px",
                      borderRadius: 8,
                    }}
                  >
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div className="est-field">
            <label>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Details…"
            />
          </div>

          {error && <div className="est-error">{error}</div>}

          <div className="est-actions">
            <button className="btn-primary" type="submit" disabled={saving || geocoding}>
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
