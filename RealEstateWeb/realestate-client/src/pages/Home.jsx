
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";

const API_ROOT = import.meta.env?.VITE_API_BASE_URL || "";


function resolveImg(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `${API_ROOT}${u}`;
  return u;
}

async function fetchEstates() {
  const url = API_ROOT ? `${API_ROOT}/api/Estate` : `/api/Estate`;
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
  return res.json();
}

function formatMoney(v, c) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(v ?? 0);
  } catch {
    return `${Number(v ?? 0).toLocaleString()} ${c || ""}`;
  }
}

function statusLabel(s) {
  if (s === "Satilik") return "For Sale";
  if (s === "Kiralik") return "For Rent";
  return s || "";
}


const RATES = { TRY: 1, USD: 40, EUR: 47 };
const CURRENCIES = ["TRY", "USD", "EUR"];

function toPriceIn(price, from, to) {
  const fr = RATES[(from || "").toUpperCase()] ?? 1;
  const tr = RATES[(to || "").toUpperCase()] ?? 1;
  const inTRY = Number(price ?? 0) * fr;
  return inTRY / tr;
}

function rolesFromJwt(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const r =
      p.role ||
      p.roles ||
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"];
    return Array.isArray(r) ? r : r ? [r] : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const navigate = useNavigate();

  // auth (UI)
  const token = localStorage.getItem("token");
  let roles = [];
  try { roles = JSON.parse(localStorage.getItem("roles") || "[]"); } catch {}
  if ((!roles || roles.length === 0) && token) roles = rolesFromJwt(token);
  const isAdmin = (roles || []).map((x) => String(x).toLowerCase()).includes("admin");

  
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // filters
  const [selectedTypes, setSelectedTypes] = useState([]);       
  const [selectedStatuses, setSelectedStatuses] = useState([]); 
  const [selectedCurrency, setSelectedCurrency] = useState(""); 
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr(null);
    fetchEstates()
      .then((list) => ok && setRaw(Array.isArray(list) ? list : []))
      .catch((e) => ok && setErr(e.message || "Error"))
      .finally(() => ok && setLoading(false));
    return () => { ok = false; };
  }, []);

  const items = useMemo(() => {
    let x = raw.map((p) => ({
      id: String(p.id),
      type: p.type,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      price: Number(p.price ?? 0),
      currency: (p.currency || "").toUpperCase(),
      thumbnailUrl: p.photos?.[0]?.imageUrl ? resolveImg(p.photos[0].imageUrl) : "",
      lat: p.location?.latitude ?? null,
      lon: p.location?.longitude ?? null,
      title: p.title,
    }));

    // type
    if (selectedTypes.length) {
      const set = new Set(selectedTypes);
      x = x.filter((i) => set.has(i.type));
    }
    // status
    if (selectedStatuses.length) {
      const set = new Set(selectedStatuses);
      x = x.filter((i) => set.has(i.status));
    }
    // currency + min/max
    if (selectedCurrency) {
      x = x.filter((i) => {
        const val = toPriceIn(i.price, i.currency, selectedCurrency);
        const minOK = minPrice === "" || val >= Number(minPrice);
        const maxOK = maxPrice === "" || val <= Number(maxPrice);
        return minOK && maxOK;
      });
    }
    return x;
  }, [raw, selectedTypes, selectedStatuses, selectedCurrency, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const view = items.slice(start, start + pageSize);

  async function handleDelete(id) {
    try {
      const url = API_ROOT ? `${API_ROOT}/api/Estate/${id}` : `/api/Estate/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${text}`);
      }
      setRaw((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (e) {
      alert("Delete failed: " + (e.message || e));
    }
  }

  function toggleIn(arr, value) {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  function clearFilters() {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedCurrency("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  return (
    <div className="shell">
      <main className="container">
        
        <div className="page-head" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
          <button
            className="btn-light"
            onClick={() => {
              if (!localStorage.getItem("token")) {
                alert("You must be logged in.");
                return;
              }
              navigate("/estates/new");
            }}
          >
            Create Estate
          </button>
        </div>

        <div className="layout">
          {/* Filter */}
          <aside className="sidebar">
            <h3 className="sidebar-title">Filters</h3>

            <div className="filter-group">
              <div className="fg-title">Property Type</div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes("Villa")}
                  onChange={() => { setSelectedTypes((a) => toggleIn(a, "Villa")); setPage(1); }}
                />
                <span>Villa</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes("Apartment")}
                  onChange={() => { setSelectedTypes((a) => toggleIn(a, "Apartment")); setPage(1); }}
                />
                <span>Apartment</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes("Land")}
                  onChange={() => { setSelectedTypes((a) => toggleIn(a, "Land")); setPage(1); }}
                />
                <span>Land</span>
              </label>
            </div>

            <div className="filter-group">
              <div className="fg-title">Status</div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes("Kiralik")}
                  onChange={() => { setSelectedStatuses((a) => toggleIn(a, "Kiralik")); setPage(1); }}
                />
                <span>For Rent</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes("Satilik")}
                  onChange={() => { setSelectedStatuses((a) => toggleIn(a, "Satilik")); setPage(1); }}
                />
                <span>For Sale</span>
              </label>
            </div>

            <div className="filter-group">
              <div className="fg-title">Currency</div>
              <select
                value={selectedCurrency}
                onChange={(e) => { setSelectedCurrency(e.target.value); setPage(1); }}
              >
                <option value="">{`(All)`}</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="fg-title" style={{ marginTop: 10 }}>
                Price {selectedCurrency ? `(${selectedCurrency})` : ""}
              </div>
              <div className="price-row">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  disabled={!selectedCurrency}
                  title={selectedCurrency ? "" : "Select currency first"}
                />
                <span className="dash">—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  disabled={!selectedCurrency}
                  title={selectedCurrency ? "" : "Select currency first"}
                />
              </div>

              <div className="filter-actions">
                <button className="btn-clear" onClick={clearFilters}>Clear</button>
              </div>
            </div>
          </aside>

          
          <section className="main">
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Thumbnail</th>
                    <th>Property Type</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Price</th>
                    <th style={{ width: 240 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={7} className="muted center">Loading...</td></tr>
                  )}
                  {err && !loading && (
                    <tr><td colSpan={7} className="error center">{err}</td></tr>
                  )}
                  {!loading && !err && view.length === 0 && (
                    <tr><td colSpan={7} className="muted center">No results</td></tr>
                  )}
                  {view.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="thumb">
                          {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt="thumb" /> : <span>N/A</span>}
                        </div>
                      </td>
                      <td>{p.type}</td>
                      <td><span className="badge">{statusLabel(p.status)}</span></td>
                      <td>{new Date(p.startDate).toLocaleDateString()}</td>
                      <td>{new Date(p.endDate).toLocaleDateString()}</td>
                      <td>{formatMoney(p.price, p.currency)}</td>
                      <td>
                        <div className="actions">
                          <Link className="link" to={`/estates/${p.id}`}>View Details</Link>
                          {isAdmin && (
                            <>
                              <Link className="link" to={`/estates/${p.id}/edit`}>Update</Link>
                              <button className="link danger" onClick={() => handleDelete(p.id)}>Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="pager">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              <div className="page-dot">{page}</div>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
