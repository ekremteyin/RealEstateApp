
import api from "./client";

export async function listPhotosByEstate(estateId) {
  const { data } = await api.get(`/Photo/estate/${estateId}`);
  return data;
}
export async function uploadPhoto(estateId, file) {
  const fd = new FormData();
  fd.append("RealEstateId", estateId);
  fd.append("File", file);
  const { data } = await api.post("/Photo/file", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
export async function deletePhoto(photoId) {
  const { data } = await api.delete(`/Photo/${photoId}`);
  return data;
}
