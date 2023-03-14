import { AUTHORITY_URL, FORMA_URL } from "@/urls";
import _ from "lodash";
import { getInstance } from "@/auth/auth0-plugin";

const state = {
  formB: { employee: {}, supervisor: {}, department: {}, form_a: {}, authority_lines: [] },
  is_loading: false,
  version: 0,
};

const getters = {
  formB: (state) => state.formB,
};

const actions = {
  async loadFormB({ commit }, id) {
    commit("setFormB", { employee: {}, supervisor: {}, department: {}, form_a: {}, authority_lines: [] });
    commit("setLoading", true);
    const auth = getInstance();

    return auth
      .get(`${AUTHORITY_URL}/${id}`)
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {});
  },
  async createFormB(store, item) {
    const auth = getInstance();

    let body = _.clone(item);
    return auth.post(`${AUTHORITY_URL}`, body).then((resp) => resp.data);
  },
  async saveFormB({ commit }, item) {
    const auth = getInstance();

    let body = _.clone(item);
    delete body.employee;
    delete body.department;
    delete body._id;

    return auth
      .put(`${AUTHORITY_URL}/${item._id}`, body)
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch((e) => {
        window.alert(`Save failed - ${e.response.data}`);
      });
  },
  async saveFormBWithFile(store, item) {
    const auth = getInstance();

    let form = new FormData();
    form.append("file", item.file);
    form.append("save_action", item.save_action);

    return auth
      .put(`${AUTHORITY_URL}/${item._id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch(() => {});
  },
  async downloadFormB(state, id) {
    const auth = getInstance();

    return auth
      .get(`${AUTHORITY_URL}/${id}/pdf`)
      .then((resp) => {
        return resp.data.data;
      })
      .catch(() => {});
  },
  async getFormBList(state, dept_id) {
    const auth = getInstance();
    const resp = await auth.get(`${AUTHORITY_URL}/department/${dept_id}`);
    return resp.data.data;
  },
  async deleteFormB(state, { id }) {
    const auth = getInstance();

    return auth.delete(`${AUTHORITY_URL}/${id}`).then((resp) => {
      return resp;
    });
  },
  async scheduleActivation({ commit }, { id, body }) {
    const auth = getInstance();

    return auth
      .post(`${AUTHORITY_URL}/${id}/activate`, body)
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {});
  },
  async cancelFormB({ commit }, item) {
    const auth = getInstance();

    return auth
      .put(`${AUTHORITY_URL}/${item._id}/cancel`, {})
      .then((resp) => {
        commit("setFormB", resp.data.data);
        return resp.data.data;
      })
      .catch((e) => {
        window.alert(`Save failed - ${e.response.data}`);
      });
  },

  async accountSearch(state, { term, date }) {
    const auth = getInstance();

    return auth.post(`${AUTHORITY_URL}/account-search`, { term, date }).then((resp) => {
      return resp.data.data;
    });
  },
};

const mutations = {
  async setFormB(state, value) {
    if (value.authority_lines) {
      for (let line of value.authority_lines) {
        line.coding_invalid = false;
        line.coding = cleanCoding(line.coding);

        if (line.coding) {
          let validationResult = await validateCoding(line);

          line.coding_invalid = !validationResult.data;
        }

        line.loans_limit = cleanZeros(line.loans_limit);
        line.other_limit = cleanZeros(line.other_limit);
        line.s23_procure_goods_limit = cleanZeros(line.s23_procure_goods_limit);
        line.s23_procure_services_limit = cleanZeros(line.s23_procure_services_limit);
        line.s23_transfer_limit = cleanZeros(line.s23_transfer_limit);
        line.s24_procure_assignment_limit = cleanZeros(line.s24_procure_assignment_limit);
        line.s24_procure_goods_limit = cleanZeros(line.s24_procure_goods_limit);
        line.s24_procure_request_limit = cleanZeros(line.s24_procure_request_limit);
        line.s24_procure_services_limit = cleanZeros(line.s24_procure_services_limit);
        line.s24_transfer_limit = cleanZeros(line.s24_transfer_limit);
        line.s24_travel_limit = cleanZeros(line.s24_travel_limit);
        line.s29_performance_limit = cleanZeros(line.s29_performance_limit);
        line.s30_payment_limit = cleanZeros(line.s30_payment_limit);
        line.is_working = false;
      }

      state.version++;
    }

    state.formB = value;
    state.is_loading = false;
  },
  setLoading(state, value) {
    state.is_loading = value;
  },
};

export function cleanCoding(input) {
  input = input || "";
  input = input.toLowerCase().replace(/[^0-9|x]/g, "");
  if (input != "x") input = input.toLowerCase().replace(/x+$/, "");
  return formatCoding(input);
}

function cleanZeros(input) {
  input = input || "";
  input = `${input}`.trim().toUpperCase();
  input = input.replace(/^0+/, "");

  if (input == "NL") return "NL";

  input = input.replace(/[^0-9|.]/g, "");

  if (input.indexOf(".") >= 0) {
    let chars = input.split("");
    let b = "";

    let dotCount = 0;
    let afterDotCount = 0;
    for (let char of chars) {
      if (char == ".") dotCount++;

      if (dotCount > 1) break;

      if (dotCount == 1) afterDotCount++;

      if (afterDotCount > 4) break;
      b += char;
    }

    return b.startsWith(".") ? `0${b}` : b;
  }

  return input;
}

export function formatCoding(input = "") {
  let account = `${input.replace(/[^0-9|x]/g, "")}ZZZZZZZZZZZZZZZZZZZZZZZZZ`;
  let dept = account.substring(0, 2);
  let vote = account.substring(2, 3);
  let prog = account.substring(3, 5);
  let activity = account.substring(5, 7);
  let element = account.substring(7, 9);
  let object = account.substring(9, 13);
  let ledger1 = account.substring(13, 17);
  let ledger2 = account.substring(17, 22);

  let output = `${dept}${vote}-${prog}${activity}${element}-${object}-${ledger1}-${ledger2}`;

  output = output.replace(/[Z]/g, "");
  output = output.replace(/[-]*$/g, "");

  return output;
}

const cache = new Map();

async function validateCoding(input) {
  if (cache.has(input.coding)) {
    return cache.get(input.coding);
  }

  const auth = getInstance();
  let result = await auth.post(`${FORMA_URL}/department/${state.formB.department_code}/validate-line`, {
    authority_line: input,
  });

  cache.set(input.coding, result);

  return result;
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
