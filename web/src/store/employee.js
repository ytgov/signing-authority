import { EMPLOYEE_URL } from "../urls";
import axios from "axios";

const state = {
    employee: {}
};

const getters = {
    employee: state => state.employee,
};

const actions = {
    async loadEmployee({ commit }, id) {
        return await axios.get(`${EMPLOYEE_URL}/${id}`)
            .then(resp => {
                commit("setEmployee", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployee", {});
            });
    },
    async saveEmployee(store) {
        let employee = store.getters.employee;

        let body = {
            first_name: employee.first_name,
            last_name: employee.last_name,
            employee_id: employee.employee_id,
            ynet_id: employee.ynet_id,
            email: employee.email
        };

        return await axios.put(`${EMPLOYEE_URL}/${employee._id}`, body)
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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};