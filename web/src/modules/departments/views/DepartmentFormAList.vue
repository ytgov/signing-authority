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
                <v-select
                    class="ml-5"
                    :items="statusOptions"
                    v-model="statusFilter"
                    label="Status"
                    single-line
                    hide-details
                    @change="statusFilterChanged"
                ></v-select>
            </template>
            <template v-slot:right>
                <create-form-a-button :department="item"></create-form-a-button>
            </template>

            <v-row>
                <v-col>
                    <v-card class="default">
                        <v-card-title>Form A Authorization</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :headers="headers"
                                :search="search"
                                :items="formAItems"

                                group-by="program_branch"
                                @click:row="openFormA"
                            >
                            <template v-slot:group.header="{items, isOpen, toggle, group}">
                                <th :colspan="1" @click="toggle">
                                    <!-- <v-icon class="ml-n2" @click="toggle">
                                        {{ isOpen ? 'mdi-minus' : 'mdi-plus' }}
                                    </v-icon> -->
                                <span class="" >
                                   {{group}}
                                </span>
                                <!-- <span class="ml-10">
                                     Positions: {{items.length}}
                                </span> -->
                                </th>
                                <td :colspan="headers.length-1" >
                                    <span v-if="!isOpen" class="">

                                     Approved: {{items.filter(item => item.status != 'Inactive (Draft)').length}}
                                </span>
                                <span  v-if="!isOpen" class="ml-10">
                                    Draft: {{items.filter(item => item.status == 'Inactive (Draft)').length}}
                                </span>
                                </td>


                            </template>
                            </v-data-table
                        ></v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </BaseCard>
    </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import createFormAButton from "../../forms/formA/components/createFormAButton.vue";

export default {
    components: { createFormAButton },
    name: "DepartmentDetail",
    componenets: {
        createFormAButton,
    },
    data: () => ({
        search: "",
        statusFilter: "Any",
        drawer: null,
        searchResults: [],
        loading: false,
        headers: [
            { text: 'Branch', value: 'program_branch' },
            { text: 'Position', value: 'position' },
            { text: 'Status', value: 'status' },
            { text: 'Reviewed',value: 'reviewed_by_department',},
        ],
        page: {
            title: "Form A Authorizations",
        },
        breadcrumbs: [
            {
                text: "Signing Authorities Home",
                to: "/dashboard",
            },
            {
                text: "",
                to: "",
                exact: true,
            },
            {
                text: "Form A Authorizations",
                disabled: true,
            },
        ],
        statusOptions: ["Any", "Active", "Inactive", "Archived"],
        allItems: [],
        formAItems: [],
        item: {},
        departmentId: null,
    }),
    mounted: async function () {
        this.departmentId = this.$route.params.departmentId;
        this.item = await this.getDepartment({ id: this.departmentId });

        this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
        this.breadcrumbs[1].text = this.item.descr;

        //this.items = this.loadList();
        this.loadFormA();
    },
    computed: {
        ...mapState("department", ["departments"]),
        ...mapGetters("department", ["getDepartmentDetails"]),
    },
    methods: {
        ...mapActions("department", ["getDepartment", "getFormAList"]),
        statusFilterChanged() {
            console.log("Only" + this.statusFilter);

            if (this.statusFilter == "Any") {
                this.formAItems = this.allItems;
                return;
            }

            this.formAItems = this.allItems.filter((i) => {
                if (this.statusFilter == "Active" && i.status == "Active")
                    return true;
                else if (
                    this.statusFilter == "Inactive" &&
                    i.status.indexOf("Inactive") == 0
                )
                    return true;
                else if (
                    this.statusFilter == "Archived" &&
                    i.status == "Archived"
                )
                    return true;

                return false;
            });
        },
        async loadFormA() {
            this.allItems = this.formAItems = await this.getFormAList({
                id: this.departmentId,
            });
            this.loadingFormA = false;
        },
        openFormA(item) {
            this.$router.push(
                `/departments/${this.departmentId}/form-a/${item._id}`
            );
        },
    },
};
</script>
