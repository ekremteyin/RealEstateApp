
import api from "./client";

export async function getEstateById(id) {
  const { data } = await api.get(`/Estate/${id}`);
  return data;
}
