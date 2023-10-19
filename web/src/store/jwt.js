import axios from "axios";
import { getInstance } from "@/auth/auth0-plugin";

export async function prepareAxios(config) {
  const auth = await getInstance();
  const token = await auth.getTokenSilently();
  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  if (config) {
    headers = { ...headers, ...config.headers };
  }

  return axios.create({
    headers,
  });
}

export async function secureGet(url) {
  let api = await prepareAxios();
  return api.get(url);
}

export async function securePut(url, body, config) {
  let api = await prepareAxios(config);
  return api.put(url, body);
}

export async function securePost(url, body, config) {
  let api = await prepareAxios(config);
  return api.post(url, body);
}

export async function secureDelete(url) {
  let api = await prepareAxios();
  return api.delete(url);
}
