import axios from "axios";
import { PROFILE_URL } from "../urls";

const state = {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    username: "",
    roles: "",
};
const getters = {
    firstName: state => state.firstName,
    lastName: state => state.lastName,
    email: state => state.email,
    id: state => state.id,
    username: state => state.username,
    roles: state => state.roles,
};
const actions = {
    async loadProfile({ commit }) {
        await axios.get(PROFILE_URL)
            .then(resp => {
                commit("setProfile", resp.data.data);
            }).catch(() => {
                commit("clearUser");
            });
    },
};
const mutations = {
    setProfile(state, profile) {
        state.firstName = profile.first_name;
        state.lastName = profile.last_name;
        state.email = profile.email;
        state.status = profile.status;
        state.roles = profile.roles;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};