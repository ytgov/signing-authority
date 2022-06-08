import { AUTHORITY_URL } from "@/urls";
import axios from "axios";
import _ from "lodash";

const state = {
    formB: { employee: {}, department: {} }
};

const getters = {
    formB: state => state.formB,
};

const actions = {
    async loadFormB({ commit }, id) {
        return axios.get(`${AUTHORITY_URL}/${id}`)
            .then(resp => {
                commit("setFormB", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setFormB", {});
            });
    },
    async saveFormB({ commit }, item) {
        let body = _.clone(item);
        delete body.employee;
        delete body.department;
        delete body._id;

        return axios.put(`${AUTHORITY_URL}/${item._id}`, body)
            .then(resp => {
                commit("setFormB", resp.data.data);
                return resp.data.data

            }).catch(() => {
                commit("setFormB", {});
            });
    },
    async downloadFormB(state, id) {
        return axios.get(`${AUTHORITY_URL}/${id}/pdf`)
            .then(resp => {
                //commit("setFormB", resp.data.data);
                console.log(resp)
                return resp.data.data

            }).catch(() => {
                //commit("setFormB", {});
            });
    }
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