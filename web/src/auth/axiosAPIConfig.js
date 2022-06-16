// A small wrapper for axios to include a jwt with the api request
// this could be refactored into vuex to get around possible async issues

import axios from "axios";
import {store} from "@/store";

console.log(store)

export const api = axios.create({
  headers: {
    "Authorization": `Bearer ${store.state.auth.token}`,
    "Content-Type": 'application/json'
  }
});

export default api;