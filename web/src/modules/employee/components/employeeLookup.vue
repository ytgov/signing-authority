<template>
    <div class="mt-7">
        <v-autocomplete
            :label="searchLocation"
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
        >
            <template slot="no-data">
                <div class="mx-4 text-caption">
                    No matches found? Try searching
                    <a @click="changeIcon">{{ searchAlt }}</a>
                </div>
            </template>
        </v-autocomplete>

        <v-card class="default">
            <v-card-text>
                Name: {{ model.display_name }}<br />
                Email: {{ model.email }} <br />
                Title: {{ model.jobTitle }}<br />
                ynet_id: {{ model.ynet_id }}<br />
                officeLocation: {{ model.officeLocation }}
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "DirectorySearchAdd",
    props: {},
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
            console.log("SELECTED", this.model);
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