import { AUTHORITY_URL } from "../urls";
import axios from "axios";

const state = {
    formB: { employee: {}, department: {}}
};

const getters = {
    formB: state => state.formB,
};

const actions = {
    async loadFormB({ commit }, id) {
        return await axios.get(`${AUTHORITY_URL}/${id}`)
            .then(resp => {
                commit("setFormB", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setFormB", {});
            });
    },
};

const mutations = {
    setFormB(state, value) {
        state.formB = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};