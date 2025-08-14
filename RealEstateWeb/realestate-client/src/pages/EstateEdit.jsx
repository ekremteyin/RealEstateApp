
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEstateById, updateEstate } from "../api/estates";
import { listPhotosByEstate, uploadPhoto, deletePhoto } from "../api/photos";
import "../styles/estate-edit.css";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "";


function resolveImg(u) {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return u;
}


const TYPE_OPTIONS = ["Villa", "Apartment", "Land"];
const STATUS_OPTIONS = ["Kiralik", "Satilik"];
const CURRENCY_OPTIONS = ["TRY", "USD", "EUR"];


function addressLine({ country, city, district, addressDetail }) {
  return [addressDetail, district, city, country].filter(Boolean).join(", ");
}


async function geocode(fullAddress) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(fullAddress);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Geocode failed: " + res.status);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("Adres bulunamadı");
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

export default function EstateEdit() {
  const { id: idParam } = useParams();
  const estateId = String(idParam ?? "");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  
  const [form, setForm] = useState({
    title: "",
    type: "",
    status: "",
    startDate: "",
    endDate: "",
    price: "",
    currency: "TRY",

    country: "",
    city: "",
    district: "",
    addressDetail: "",

    location: { latitude: null, longitude: null },
    description: "",
  });

  const [photos, setPhotos] = useState([]);

  
  useEffect(() => {
    if (!estateId) {
      setErr("Geçersiz id");
      setLoading(false);
      return;
    }
    let ok = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const e = await getEstateById(estateId);
        const ph = await listPhotosByEstate(estateId);

        const start = e?.startDate ? String(e.startDate).slice(0, 10) : "";
        const end = e?.endDate ? String(e.endDate).slice(0, 10) : "";

        const loc = e?.location || {};

        if (!ok) return;
        setForm((prev) => ({
          ...prev,
          title: e?.title ?? "",
          type: e?.type ?? "",
          status: e?.status ?? "",
          startDate: start,
          endDate: end,
          price: e?.price ?? "",
          currency: e?.currency ?? "TRY",

          country: loc.country ?? "",
          city: loc.city ?? "",
          district: loc.district ?? "",
          addressDetail: loc.addressDetail ?? "",

          location: {
            latitude: loc.latitude ?? null,
            longitude: loc.longitude ?? null,
          },
          description: e?.description ?? "",
        }));

        setPhotos(Array.isArray(ph) ? ph : ph?.items ?? []);
      } catch (e) {
        console.error("load edit error:", e);
        setErr(e?.message || "Kayıt yüklenemedi");
      } finally {
        ok && setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [estateId]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  
  async function handleSave(e) {
    e?.preventDefault?.();
    setSaving(true);
    setErr("");
    try {
      
      const full = addressLine({
        country: form.country,
        city: form.city,
        district: form.district,
        addressDetail: form.addressDetail,
      });

      
      let lat = form.location.latitude;
      let lon = form.location.longitude;
      if (full) {
        try {
          const r = await geocode(full);
          lat = r.lat;
          lon = r.lon;
        } catch {
         
        }
      }

      
      const next = {
        ...form,
        location: { latitude: lat, longitude: lon },
      };

      await updateEstate(estateId, next); 
      alert("Güncellendi.");
      navigate(`/estates/${estateId}`);
    } catch (e) {
      console.error("update error:", e?.response?.data || e);
      setErr(e?.response?.data || e?.message || "Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  }

  
  async function handleUpload(ev) {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;
    try {
      for (const f of files) await uploadPhoto(estateId, f);
      const ph = await listPhotosByEstate(estateId);
      setPhotos(Array.isArray(ph) ? ph : ph?.items ?? []);
      ev.target.value = "";
    } catch (e) {
      alert(e?.response?.data || e?.message || "Yükleme başarısız");
    }
  }
  async function handlePhotoDelete(photoId) {
    if (!confirm("Fotoğraf silinsin mi?")) return;
    try {
      await deletePhoto(photoId);
      setPhotos((p) => p.filter((x) => String(x.id) !== String(photoId)));
    } catch (e) {
      alert(e?.response?.data || e?.message || "Silme başarısız");
    }
  }

  const cover = useMemo(() => resolveImg(photos?.[0]?.imageUrl || ""), [photos]);

  if (loading) {
    return (
      <div className="edit-wrap">
        <div className="edit-card">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <div className="edit-wrap">
      <div className="edit-card">
        <h2 className="edit-title">Edit Estate</h2>
        {err && <div className="edit-error">{String(err)}</div>}

        {cover && (
          <div className="cover">
            <img src={cover} alt="cover" />
          </div>
        )}

        
        <form className="grid-2" onSubmit={handleSave}>
          <label className="field">
            <span className="label">Title *</span>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="label">Property Type *</span>
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
              required
            >
              <option value="">Select Property Type</option>
              {TYPE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Status *</span>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              required
            >
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Currency *</span>
            <select
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
              required
            >
              <option value="">Select Currency</option>
              {CURRENCY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Price *</span>
            <input
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="Enter Price"
              required
            />
          </label>

          <label className="field">
            <span className="label">Start Date *</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="label">End Date *</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setField("endDate", e.target.value)}
              required
            />
          </label>

          
          <div className="spacer-2" />
          <div className="spacer-2" />

          <label className="field">
            <span className="label">Country</span>
            <input
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
              placeholder="Türkiye"
            />
          </label>

          <label className="field">
            <span className="label">City</span>
            <input
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="İl"
            />
          </label>

          <label className="field">
            <span className="label">District</span>
            <input
              value={form.district}
              onChange={(e) => setField("district", e.target.value)}
              placeholder="İlçe"
            />
          </label>

          <label className="field">
            <span className="label">Address Detail</span>
            <input
              value={form.addressDetail}
              onChange={(e) => setField("addressDetail", e.target.value)}
              placeholder="Mahalle / Cadde / No"
            />
          </label>

          <label className="field col-2">
            <span className="label">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </label>

          <div className="actions col-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate(`/estates/${estateId}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

       
        <div className="upload-block">
          <h3 className="block-title">Upload Photos</h3>
          <p className="muted">Bilgisayarından seç; yükleme anında yapılır.</p>
          <input type="file" accept="image/*" multiple onChange={handleUpload} />

          <div className="photo-grid">
            {photos.map((ph) => (
              <div key={ph.id} className="photo-card">
                <img src={resolveImg(ph.imageUrl)} alt="" />
                <button
                  className="btn-danger"
                  onClick={() => handlePhotoDelete(ph.id)}
                >
                  Delete
                </button>
              </div>
            ))}
            {photos.length === 0 && <div className="muted">No photos yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
