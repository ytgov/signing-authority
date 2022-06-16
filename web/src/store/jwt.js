import axios from "axios";
import { getInstance } from "@/auth/auth0-plugin"

export async function secureGet(url) {
  let auth = await getInstance();
  let token = await auth.getTokenSilently();
  return axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
}

export async function securePut(url, body) {
  let auth = await getInstance();
  let token = await auth.getTokenSilently();
  return axios.put(url, body, { headers: { Authorization: `Bearer ${token}` } });
}

export async function securePost(url, body) {
  let auth = await getInstance();
  let token = await auth.getTokenSilently()
  return axios.post(url, body, { headers: { Authorization: `Bearer ${token}` } });
}

export async function secureDelete(url) {
  let auth = await getInstance();
  let token = await auth.getTokenSilently();
  return axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
}
