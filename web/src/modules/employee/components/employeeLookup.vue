<template>
    <div>
        <v-autocomplete
            :label="`${label} ${searchLocation}`"
            v-model="model"
            :items="items"
            :loading="isLoading"
            :search-input.sync="search"
            item-text="long_name"
            append-icon="mdi-search"
            item-value="id"
            auto-select-first
            no-filter
            outlined
            dense
            clearable
            return-object
            @click:prepend="changeIcon"
            @change="selected"
            ref="searchField"
        >
            <template slot="no-data">
                <div class="mx-4 text-caption">
                    <strong>No matches found?</strong>
                    This search matches the beginning of names and titles only
                </div>
            </template>
        </v-autocomplete>

        <v-card class="default mb-4" v-if="model && model.email">
            <v-card-text>
                <v-row>
                    <v-col cols="9">
                        <strong>Name:</strong> {{ model.display_name }} ({{
                            model.ynet_id
                        }})<br />
                        <strong>Department:</strong> {{ model.department }} :
                        {{ model.title }}<br />
                        <strong>Email:</strong> {{ model.email }} <br />
                        <strong>Location:</strong> {{ model.officeLocation }}
                    </v-col>
                    <v-col class="text-right">
                        <v-btn
                            @click="doSelect"
                            color="primary"
                            class="mb-0"
                            small
                        >
                            <v-icon class="mr-2">mdi-account-check</v-icon>
                            {{ actionName }}
                        </v-btn>
                        <v-btn
                            @click="clear"
                            color="secondary"
                            class="ml-4 mb-0 mt-4"
                            small
                            >Clear</v-btn
                        ></v-col
                    >
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "DirectorySearchAdd",
    props: ["select", "actionName", "label"],
    data: () => ({
        isLoading: false,
        items: [],
        search: "",
        model: {},
        searchIndex: 1,
        searches: [
            {
                name: "Existing employee search",
                icon: "mdi-account-search",
                alt: "YNET directory search",
            },
            {
                name: "YNET directory search",
                icon: "mdi-account-search",
                alt: "Existing employee search",
            },
        ],
    }),
    methods: {
        ...mapActions("employee", ["searchEmployees", "searchDirectory"]),
        changeIcon() {
            /* this.searchIndex === this.searches.length - 1
                ? (this.searchIndex = 0)
                : this.searchIndex++; */
        },
        selected() {
            this.search = "";
        },
        doSelect() {
            if (this.select) {
                this.select(this.model);
                this.clear();
            }
        },
        clear() {
            this.model = {};
            this.search = "";
        },
    },
    computed: {
        searchIcon() {
            return this.searches[this.searchIndex].icon;
        },
        searchLocation() {
            return this.searches[this.searchIndex].name;
        },
        searchAlt() {
            return this.searches[this.searchIndex].alt;
        },
    },
    watch: {
        search(val) {
            if (!val) {
                this.items = [];
                return;
            }
            if (this.isLoading) this.isLoading = true;

            if (this.searchIndex == 0) {
                this.searchEmployees({ terms: val })
                    .then((res) => {
                        this.items = res;
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .finally(() => (this.isLoading = false));
            } else {
                this.searchDirectory({ terms: val })
                    .then((res) => {
                        this.items = res;
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .finally(() => (this.isLoading = false));
            }
        },
    },
};
</script> 