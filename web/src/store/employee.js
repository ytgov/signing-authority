import { EMPLOYEE_URL } from "../urls";
import { secureGet, securePut } from "./jwt";

const state = {
    employee: {},
    authorities: []
};

const getters = {
    employee: state => state.employee,
};

const actions = {
    async loadEmployee({ commit }, id) {
        return await secureGet(`${EMPLOYEE_URL}/${id}`)
            .then(resp => {
                commit("setEmployee", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployee", {});
            });
    },
    async loadEmployeeAuthorities({ commit }, id) {
        return await secureGet(`${EMPLOYEE_URL}/${id}/authorities`)
            .then(resp => {
                commit("setEmployeeAuthorities", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployeeAuthorities", {});
            });
    },
    async saveEmployee(store) {
        let employee = store.getters.employee;

        let body = {
            first_name: employee.first_name,
            last_name: employee.last_name,
            employee_id: employee.employee_id,
            ynet_id: employee.ynet_id,
            email: employee.email,
            primary_department: employee.primary_department
        };

        return await securePut(`${EMPLOYEE_URL}/${employee._id}`, body)
            .then(resp => {
                //commit("setEmployee", resp.data.data);
                return resp.data.data
            }).catch(() => {
                store.commit("setEmployee", {});
            });
    },
};

const mutations = {
    setEmployee(state, value) {
        state.employee = value;
    },
    setEmployeeAuthorities(state, value) {
        state.authorities = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};