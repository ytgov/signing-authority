/*eslint-disable no-unused-vars */

import { FORMA_URL } from "@/urls";
import _ from "lodash";

import { getInstance } from "@/auth/auth0-plugin";

const state = {
  formA: { employee: {}, department: {}, audit_lines: [] }
};

const getters = {
  isActive: state => {
    if (state.formA.reviewed_by_department) {
      //we might consider a check on issue date and if a form is uploaded.
      return true;
    }
    return false;
  },
  isLocked: () => {
    //Decide what is the test a locked form A. In the meantime
    if (state.formA.activation || state.formA.deactivation) {
      //we might consider a check on issue date and if a form is uploaded.
      return true;
    }
    return false;
  },
  status: () => {
    if (state.formA.deactivation) return "Archived";
    if (state.formA.activation) return "Active";
    return "Inactive (Draft)";
  }
};

const actions = {
  async loadFormA({ commit }, { id }) {
    const auth = getInstance();
    return auth
      .get(`${FORMA_URL}/${id}`)
      .then(resp => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch(err => {
        console.log("ERRROR FOUND INHGERE", err);
        commit("setFormA", {});
      });
  },
  async createFormA({ commit }, item) {
    const auth = getInstance();
    // console.log(item)

    return auth
      .post(`${FORMA_URL}`, item)
      .then(resp => {
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
    delete body.employee;
    delete body.department;
    delete body._id;

    return auth
      .put(`${FORMA_URL}/${item._id}`, body)
      .then(resp => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        commit("setFormA", {});
      });
  },
  async duplicateFormA({ commit, state }) {
    /*
        Create a new FormA instance with a copy of the data in the current
        Form A.
        */

    let dupe = {};
    dupe.department_code = state.formA.department_code;
    dupe.department_name = state.formA.department_descr;
    dupe.program_branch = state.formA.program_branch;
    dupe.position = `${state.formA.position} (Duplicate)`;
    dupe.issue_date = new Date();
    dupe.reviewed_by_department = false;
    dupe.authority_lines = state.formA.authority_lines;
    dupe.created_by = ""; //TODO: get user from the store
    dupe.parentFormA = state.formA._id; //TODO: decide how to audit a clone

    const auth = getInstance();
    return auth
      .post(`${FORMA_URL}`, dupe)
      .then(resp => {
        commit("setFormA", resp.data.data);
        return resp.data.data;
      })
      .catch(() => {
        console.error(`Could not duplicate Form A ${state.formA._id}`);
        commit("setFormA", { authority_lines: [] });
      });
  },

  async archiveFormA({ commit, state }, archiveDetails) {
    const auth = getInstance();

    let body = _.clone(state.formA);

    body.deactivation = archiveDetails;
    delete body._id;

    return auth
      .put(`${FORMA_URL}/${state.formA._id}/?archive=true`, body)
      .then(resp => {
        commit("setFormA", { authority_lines: [] });
        console.log("got a 200 response");
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
      .then(resp => {
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
    const body = { "program_branch": config.branch };

    return await auth.post(
      `${FORMA_URL}/department/${config.dept}/branch`, body).then(resp => {
        return resp.data.data
      });

  }
};

const mutations = {
  setFormA(state, value) {
    if (value.program_branch == "") value.program_branch = "ALL";

    for (let line of value.authority_lines) {
      line.coding = cleanCoding(line.coding);
      line.contracts_for_goods_services = cleanZeros(
        line.contracts_for_goods_services
      );
      line.loans_and_guarantees = cleanZeros(line.loans_and_guarantees);
      line.transfer_payments = cleanZeros(line.transfer_payments);
      line.authorization_for_travel = cleanZeros(line.authorization_for_travel);
      line.request_for_goods_services = cleanZeros(
        line.request_for_goods_services
      );
      line.assignment_authority = cleanZeros(line.assignment_authority);
      line.s29_performance_limit = cleanZeros(line.s29_performance_limit);
      line.s30_payment_limit = cleanZeros(line.s30_payment_limit);
    }

    state.formA = value;
  }
};

function cleanCoding(input) {
  input = input || "";
  input = input.toLowerCase().replace(/[^0-9|x]/g, "");
  return input;
}

function cleanZeros(input) {
  input = input || "";
  input = `${input}`.trim().toUpperCase();

  if (input == "0" || input == "00" || input == "000" || input == "0000")
    return "";

  if (input == "NL") return "NL";

  input = input.replace(/[^0-9]/g, "");

  return input;
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
