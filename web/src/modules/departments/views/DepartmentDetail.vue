<template>
    <v-container fluid class="down-top-padding">
        <BaseBreadcrumb
            :title="page.title"
            :icon="page.icon"
            :breadcrumbs="breadcrumbs"
        >
            <template v-slot:right>
                <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
            </template>
        </BaseBreadcrumb>

        <BaseCard :showHeader="true">
            <template v-slot:left>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>
            </template>
            <template v-slot:right> </template>

            <v-row>
                <v-col>
                    <department-form-a-list :search="search" :pendingGroups="pendingGroups" />
                </v-col>
                <v-col>
                    <department-form-b-list :search="search" />
                </v-col>
            </v-row>
        </BaseCard>
    </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import departmentFormAList from "../components/departmentFormAList";
import departmentFormBList from "../components/departmentFormBList";

export default {
    components: {
        departmentFormAList,
        departmentFormBList,
    },
    name: "DepartmentDetail",
    data: () => ({
        search: "",
        drawer: null,
        searchResults: [],
        loading: false,
        page: {
            title: "Departments",
        },
        breadcrumbs: [
            {
                text: "Signing Authorities Home",
                to: "/dashboard",
            },
            {
                text: "",
                disabled: true,
            },
        ],
        departmentId: "",
        item: {},
        loadingFormB: true,
        pendingGroups: [],
    }),
    mounted: async function () {
        this.departmentId = this.$route.params.departmentId;
        this.loadList();
    },
    computed: {
        ...mapState("department", ["departments"]),
    },
    methods: {
        ...mapActions("department", ["getDepartment", "getPendingGroups"]),

        async loadList() {
            this.item = await this.getDepartment({ id: this.departmentId });
            if (this.item && this.item.dept) {
                this.breadcrumbs[1].text = this.item.descr;
                this.page.title = this.item.descr;
            }

            this.pendingGroups = await this.getPendingGroups({
                id: this.departmentId,
            });
        },
    },
};
</script>
