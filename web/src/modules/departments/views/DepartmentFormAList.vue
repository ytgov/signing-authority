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
                                :group-by="grouping"
                                @click:row="openFormA"
                            >
                                <template
                                    v-slot:group.header="{
                                        items,
                                        isOpen,
                                        toggle,
                                        group,
                                    }"
                                >
                                    <th :colspan="1" @click="toggle">
                                        <v-icon class="mr-2 ml-0">
                                            {{
                                                isOpen
                                                    ? "mdi-chevron-up"
                                                    : "mdi-chevron-down"
                                            }}
                                        </v-icon>
                                        <span class="ml-n2">
                                            Program / Branch: {{ group }}
                                        </span>
                                        <!-- <span class="ml-10">
                                     Positions: {{items.length}}
                                </span> -->
                                    </th>
                                    <td>
                                        <span v-if="!isOpen" class="">
                                            Approved:
                                            {{
                                                items.filter(
                                                    (item) =>
                                                        item.status !=
                                                        "Inactive (Draft)"
                                                ).length
                                            }}
                                        </span>
                                        <span v-if="!isOpen" class="ml-10">
                                            Draft:
                                            {{
                                                items.filter(
                                                    (item) =>
                                                        item.status ==
                                                        "Inactive (Draft)"
                                                ).length
                                            }}
                                        </span>
                                    </td>
                                    <td :colspan="headers.length - 2">
                                        <router-link
                                            :to="{
                                                name: 'FormABranchDetails',
                                                params: {
                                                    departmentId: departmentId,
                                                    branchName: group,
                                                },
                                            }"
                                        >
                                            View Group
                                        </router-link>
                                        <!-- <span @click="openBranchFormA(group)">
                        View Branch Form A
                    </span> -->
                                    </td>
                                </template>
                                <!-- <template v-slot:group.summary="{ group }">
                  <span>
                    <v-btn primary @click="openBranchFormA(group)">
                      bundle
                    </v-btn>
                  </span>
                </template> -->
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </BaseCard>
    </v-container>
</template>

<script>
/*------ TODO ------*/
// tidy up HTML code and break into multiple components

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
        statusFilter: "Not Archived",
        drawer: null,
        searchResults: [],
        loading: false,
        grouping: "program_branch",
        headers: [
            { text: "Branch", value: "program_branch" },
            { text: "Position", value: "position" },
            { text: "Status", value: "status" },
            { text: "Reviewed", value: "reviewed_by_department" },
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
        statusOptions: [
            "Any",
            "Active",
            "Inactive",
            "Not Archived",
            "Archived",
        ],
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
        openBranchFormA: function (branchName) {
            this.$router.push(
                "/departments/" +
                    this.departmentId +
                    "/form-a/branch/" +
                    branchName
            );
        },
        ...mapActions("department", ["getDepartment", "getFormAList"]),
        statusFilterChanged() {
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
                else if (
                    this.statusFilter == "Not Archived" &&
                    i.status != "Archived"
                )
                    return true;

                return false;
            });
        },
        async loadFormA() {
            this.allItems = this.formAItems = await this.getFormAList({
                id: this.departmentId,
            });
            this.statusFilterChanged();
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
