/*eslint-disable no-unused-vars */

import { FORMA_URL } from "@/urls";
import _ from "lodash";

import { getInstance } from "@/auth/auth0-plugin";

const state = {
  formA: { employee: {}, department: {}, audit_lines: [], status: "", authority_lines: [] },
  is_loading: false,
  version: 0,
};

const getters = {
  isActive: () => {
    return state.formA.status == "Active";
  },
  isLocked: () => {
    //Decide what is the test a locked form A. In the meantime
    if (state.formA.activation || state.formA.deactivation || state.formA.position_group_id) {
      //we might consider a check on issue date and if a form is uploaded.
      return true;
    }
    return false;
  },
  status: () => {
    if (state.formA.deactivation) return "Archived";
    if (state.formA.activation) return "Active";
    if (state.formA.position_group_id) return "Locked";
    return "Inactive (Draft)";
  },
};

const actions = {
  async loadFormA({ commit }, { id }) {
    commit("setFormA", { employee: {}, department: {}, audit_lines: [], status: "", authority_lines: [] });
    commit("setLoading", true);
    const auth = getInstance();

    return auth
      .get(`${FORMA_URL}/${id}`)
      .then((resp) => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch((err) => {
        commit("setFormA", {});
      });
  },
  async createFormA({ commit }, item) {
    const auth = getInstance();
    // console.log(item)

    return auth
      .post(`${FORMA_URL}`, item)
      .then((resp) => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        commit("setFormA", {});
      });
  },
  async saveFormA({ commit }, item) {
    const auth = getInstance();
    let body = _.clone(item);
    if (!item.keep_employee) delete body.employee;
    delete body.department;
    delete body._id;

    return auth
      .put(`${FORMA_URL}/${item._id}`, body)
      .then((resp) => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch((e) => {
        //window.alert(`Save failed - ${e.response.data}`);
        return e.response
      });
  },
  async duplicateFormA({ commit, state }) {
    /*
        Create a new FormA instance with a copy of the data in the current
        Form A.
        */

    let dupe = {};
    dupe.department_code = state.formA.department_code;
    dupe.department_descr = state.formA.department_descr;
    dupe.program_branch = state.formA.program_branch;
    dupe.activity = state.formA.activity;
    dupe.position = `${state.formA.position} (Duplicate)`;
    dupe.authority_lines = state.formA.authority_lines;
    dupe.parentFormA = state.formA._id; //TODO: decide how to audit a clone
    dupe.is_deputy_minister = false;
    dupe.is_deputy_duplicate = state.formA.is_deputy_minister;

    const auth = getInstance();
    return await auth
      .post(`${FORMA_URL}`, dupe)
      .then((resp) => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        console.error(`Could not duplicate Form A ${state.formA._id}`);
        commit("setFormA", { authority_lines: [] });
      });
  },
  async deleteFormA({ commit }, id) {
    const auth = getInstance();

    return auth.delete(`${FORMA_URL}/${id}`).then((resp) => {
      return resp;
    });
  },

  async archiveFormA({ commit, state }, archiveDetails) {
    const auth = getInstance();

    let body = _.clone(state.formA);

    body.deactivation = archiveDetails;
    delete body._id;

    return auth
      .put(`${FORMA_URL}/${state.formA._id}/?archive=true`, body)
      .then((resp) => {
        commit("setFormA", { authority_lines: [] });
        return resp.code;
      })
      .catch(() => {
        console.log(`Error archiving form A ${state.formA._id}`);
        commit("setFormA", { authority_lines: [] });
      });
  },
  async downloadFormA(state, id) {
    const auth = getInstance();
    return auth
      .get(`${FORMA_URL}/${id}/pdf`)
      .then((resp) => {
        //commit("setFormB", resp.data.data);
        //   console.log(resp)
        return resp.data.data;
      })
      .catch(() => {
        //commit("setFormB", {});
      });
  },
  // Department Sepcific FormAs
  async getDepartmentFormAList(state, department_code) {
    const auth = getInstance();
    const a = await auth.get(`${FORMA_URL}/department/${department_code}`);
    return a.data.data;
  },

  async getBranchBundle({ state }, config) {
    const auth = getInstance();
    const body = { program_branch: config.branch };

    return await auth.post(`${FORMA_URL}/department/${config.dept}/branch`, body).then((resp) => {
      return resp.data.data;
    });
  },

  async dmValidate({ state }) {
    const auth = getInstance();
    return await auth
      .post(`${FORMA_URL}/${state.formA._id}/dm-validate`, {})
      .then((resp) => {
        return resp.data.data;
      })
      .catch((e) => {
        console.log("ERROR", e.response.data);
        return e.response.data;
      });
  },
};

const mutations = {
  async setFormA(state, value) {
    //if (value.program_branch == "") value.program_branch = "ALL";

    for (let line of value.authority_lines) {
      line.coding_invalid = false;
      line.coding = cleanCoding(line.coding);

      if (line.coding) {
        let validationResult = await validateCoding(line);
        line.coding_invalid = !validationResult.data;
      }

      line.contracts_for_goods_services = cleanZeros(line.contracts_for_goods_services);
      line.loans_and_guarantees = cleanZeros(line.loans_and_guarantees);
      line.transfer_payments = cleanZeros(line.transfer_payments);
      line.authorization_for_travel = cleanZeros(line.authorization_for_travel);
      line.request_for_goods_services = cleanZeros(line.request_for_goods_services);
      line.assignment_authority = cleanZeros(line.assignment_authority);
      line.s29_performance_limit = cleanZeros(line.s29_performance_limit);
      line.s30_payment_limit = cleanZeros(line.s30_payment_limit);

      line.is_working = false;
    }

    state.formA = value;
    state.is_loading = false;
    state.version++;
  },
  setLoading(state, value) {
    state.is_loading = value;
  },
};

function cleanCoding(input) {
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

function formatCoding(input = "") {
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
  let result = await auth.post(`${FORMA_URL}/department/${state.formA.department_code}/validate-line`, {
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
