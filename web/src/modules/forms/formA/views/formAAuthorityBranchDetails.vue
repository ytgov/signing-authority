<template>
    <v-container fluid class="down-top-padding">
        <BaseBreadcrumb
            :title="page.title"
            :icon="page.icon"
            :breadcrumbs="breadcrumbs"
        >
        </BaseBreadcrumb>

        <BaseCard
            :showHeader="true"
            :heading="`Delegation of Financial Signing Authority - FORM A: ${this.$route.params.branchName}`"
        >
            <template slot="right">
                <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->

                <!-- <v-menu offset-y left>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="secondary"
                            small
                            v-bind="attrs"
                            v-on="on"
                            class="mt-3"
                        >
                            Actions <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item v-if="hasDrafts">
                            <v-list-item-icon
                                ><v-icon>mdi-lock</v-icon></v-list-item-icon
                            >
                            <v-list-item-title
                                >Lock for Signatures
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu> -->
            </template>

            <v-row class="mb-2">
                <v-col cols="6" sm="4" md="3" lg="2">
                    <v-card>
                        <v-card-text>
                            <div style="font-size: 32px">
                                {{ delegations.length }}
                            </div>
                            Delegation{{ delegations.length != 1 ? "s" : "" }}
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="6" sm="4" md="3" lg="2" v-if="hasDrafts">
                    <v-card class="warning" dark>
                        <v-card-text>
                            <div style="font-size: 32px">
                                {{
                                    delegations.filter(
                                        (d) => d.status == "Inactive (Draft)"
                                    ).length
                                }}
                            </div>
                            In Draft
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col> </v-col>
            </v-row>
            <v-card class="default">
                <v-card-text>
                    <formATable :branchBundle="holder"></formATable>
                </v-card-text>
            </v-card>
        </BaseCard>
    </v-container>
</template>

<script>
// import { AUTHORITY_URL} from "@/urls"
import { mapActions } from "vuex";
import formATable from "../components/formATable.vue";

export default {
    name: "AuthorityDetails",
    components: {
        formATable,
    },
    data: () => ({
        loading: false,
        holder: [],
        page: {
            title: "",
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
                to: "",
                exact: true,
            },
            {
                text: "",
                to: "",
            },
        ],
        department: {},
        authority: {},
        showUpload: false,
        delegations: [],
    }),
    computed: {
        // ...mapState("department", ["departments"]),
        // ...mapState("authority/formA", ["formA"]),
        // ...mapGetters("authority/formA", ["isActive", "isLocked", "status"])
        hasDrafts() {
            return (
                this.delegations.filter((d) => d.status == "Inactive (Draft)")
                    .length > 0
            );
        },
    },
    async mounted() {
        this.delegations = await this.$store.dispatch(
            "authority/formA/getBranchBundle",
            {
                dept: this.$route.params.departmentId,
                branch: this.$route.params.branchName,
            }
        );

        this.delegations = this.delegations.filter(
            (d) => d.status != "Archived"
        );

        this.holder = this.delegations.flatMap((role) =>
            role.authority_lines.map((line) =>
                Object.assign(line, { position: role.position })
            )
        );

        this.id = this.$route.params.id;

        let departmentId = this.$route.params.departmentId;
        this.department = await this.getDepartment({ id: departmentId });
        this.breadcrumbs[1].text = this.department.descr;
        this.breadcrumbs[1].to = `/departments/${departmentId}`;
        this.breadcrumbs[2].to = `/departments/${departmentId}/form-a`;
        this.page.title = this.$route.params.branchName;
        // this.page.title = `${formA.program_branch}: ${formA.position}`;
        this.breadcrumbs[3].text = this.page.title;
    },
    methods: {
        ...mapActions("department", ["getDepartment"]),
        // ...mapActions("authority/formA", ["loadFormA"])
    },
};
</script>
