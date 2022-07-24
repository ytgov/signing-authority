import { EMPLOYEE_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin"

const state = {
    employee: {},
    authorities: []
};

const getters = {
    employee: state => state.employee,
};

const actions = {
    async loadEmployee({ commit }, id) {
        const auth = getInstance();

        return await auth.get(`${EMPLOYEE_URL}/${id}`)
            .then(resp => {
                commit("setEmployee", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployee", {});
            });
    },
    async loadEmployeeAuthorities({ commit }, id) {
        const auth = getInstance();

        return await auth.get(`${EMPLOYEE_URL}/${id}/authorities`)
            .then(resp => {
                commit("setEmployeeAuthorities", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setEmployeeAuthorities", {});
            });
    },
    async saveEmployee(store) {
        const auth = getInstance();

        let employee = store.getters.employee;

        let body = {
            first_name: employee.first_name,
            last_name: employee.last_name,
            employee_id: employee.employee_id,
            ynet_id: employee.ynet_id,
            email: employee.email,
            primary_department: employee.primary_department
        };

        return await auth.put(`${EMPLOYEE_URL}/${employee._id}`, body)
            .then(resp => {
                //commit("setEmployee", resp.data.data);
                return resp.data.data
            }).catch(() => {
                store.commit("setEmployee", {});
            });
    },
    async searchEmployees(store, { terms }) {
        const auth = getInstance();

        return auth.post(`${EMPLOYEE_URL}/search`, { terms }).then(resp => {
            return resp.data.data
        })
    }
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