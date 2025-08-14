
import api from "./client";


export async function listEstates(params = {}) {
  const { data } = await api.get("/Estate", {
    params: { _ts: Date.now(), ...params },   
  });
  return data;
}

export async function createEstate(payload) {
  const { data } = await api.post("/Estate", payload);
  return data;
}
function parsePrice(v) {
  return typeof v === "string"
    ? Number(v.replace(/\./g, "").replace(",", "."))
    : Number(v ?? 0);
}

export async function updateEstate(id, form) {
  const dto = {
    Id: Number(id),
    Title: form.title,
    Description: form.description ?? null,
    Type: form.type,        
    Status: form.status,     
    Currency: form.currency, 
    Price: parsePrice(form.price),
    StartDate: form.startDate, 
    EndDate: form.endDate,     
    Location: {
      Country: form.country || "",
      City: form.city || "",
      District: form.district || "",
      AddressDetail: form.addressDetail || "",
      Latitude: form.location?.latitude ?? 0,
      Longitude: form.location?.longitude ?? 0,
    },
  };
   const { data } = await api.put("/Estate", dto);
  return data;
}

export async function deleteEstate(id) {
  const { data } = await api.delete(`/Estate/${id}`);
  return data;
}


export async function getEstateById(id) {
  const { data } = await api.get(`/Estate/${id}`);
  return data;
}
