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

                <v-btn color="primary"></v-btn>
            </template>

            <v-row class="mb-2">
                <v-col>
                    <v-card>
                        <v-card-text>
                          <div style="font-size:32px">{{$route.params.branchName}}</div>
                          Program / Branch
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col>
                    <v-card>
                        <v-card-text>
                          <div style="font-size:32px">{{delegations.length}}</div>
                          Delegations
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col>
                    <v-card>
                        <v-card-text>
                          <div style="font-size:32px">2</div>
                          Active
                        </v-card-text>
                    </v-card>
                </v-col>
              <v-col>

              </v-col>
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
        delegations: []
    }),
    computed: {
        // ...mapState("department", ["departments"]),
        // ...mapState("authority/formA", ["formA"]),
        // ...mapGetters("authority/formA", ["isActive", "isLocked", "status"])
    },
    async mounted() {
        this.delegations = await this.$store.dispatch(
            "authority/formA/getBranchBundle",
            {
                dept: this.$route.params.departmentId,
                branch: this.$route.params.branchName,
            }
        );

  console.log(this.delegations)

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
