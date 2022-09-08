import { DEPARTMENT_URL, FORMA_URL, AUTHORITY_URL } from "@/urls";
import { getInstance } from "@/auth/auth0-plugin"

const state = {
    departments: [],
};

const getters = {
    departmentList: (state) => {
        return state.departments.map(a => ({ "descr": a.descr, "dept": a.dept, "display_name": a.display_name }))
    },
    getDepartmentDetails: (state) => (deptId) => {
        //return the details of a department for given departmentId
        return state.departments.find(a => a.dept === deptId)
    }
}
const actions = {
    async initialize(store) {
        console.log("-- Initializing Department Store")
        await store.dispatch("loadDepartments")
    },
    async loadDepartments({ state, commit }) {
        if (state.departments.length > 0) {
            return;
        }

        const auth = getInstance();

        await auth.get(`${DEPARTMENT_URL}`).then(resp => {
            commit("setDepartments", resp.data.data);
            return resp.data.data;
        }).catch(() => {
            commit("setDepartments", []);
        });
    },
    async getDepartment(store, { id }) {
        if (store.state.departments.length == 0) {
            await store.dispatch("initialize");
        }

        let dept = store.state.departments.filter(d => d.dept == id);
        return dept[0];
    },
    async getFormAList(store, { id }) {
        const auth = getInstance();

        return auth.get(`${FORMA_URL}/department/${id}`).then(resp => {
            return resp.data.data
        })
    },
    async getFormBList(store, { id }) {
        const auth = getInstance();

        return auth.get(`${AUTHORITY_URL}/department/${id}`).then(resp => {
            return resp.data.data
        })
    },

    async getProgramList(store, { id }) {
        const auth = getInstance();

        return auth.get(`${FORMA_URL}/department/${id}/program`).then(resp => {
            return resp.data.data
        })
    },

    async getActivityList(store, { id }) {
        const auth = getInstance();

        return auth.get(`${FORMA_URL}/department/${id}/activity`).then(resp => {
            return resp.data.data
        })
    },

    async generateFormA(store, { id, items }) {
        const auth = getInstance();

        return auth.post(`${FORMA_URL}/department/${id}`, { items })
            .then(resp => resp.data.data)
    },

    async getPendingGroups(store, { id }) {
        const auth = getInstance();

        return auth.get(`${FORMA_URL}/department/${id}/pending-groups`)
            .then(resp => resp.data.data)
    },
};

const mutations = {
    setDepartments(state, value) {
        state.departments = value;
    },
};

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};