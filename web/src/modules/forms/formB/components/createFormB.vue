<template>
    <div>
        <v-dialog v-model="show" persistent width="800">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="primary"
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click="doShow"
                    >Add</v-btn
                >
            </template>

            <v-app-bar dark color="#0097A9">
                <v-toolbar-title>
                    Add Form B for {{ department.descr }}
                </v-toolbar-title>
                <v-spacer />
                <v-icon title="Close" @click="show = false">mdi-close</v-icon>
            </v-app-bar>
            <v-card tile>
                <v-card-text class="mt-5 pb-0">
                    <employee-lookup
                        actionName="Select"
                        label="Employee : "
                        :select="pickEmployee"
                        v-if="!selectedEmployee.email"
                    ></employee-lookup>

                    <v-text-field
                        v-model="selectedEmployee.display_name"
                        readonly
                        dense
                        outlined
                        label="Employee"
                        append-icon="mdi-lock"
                        v-if="selectedEmployee.email"
                        append-outer-icon="mdi-close-circle"
                        @click:append-outer="unselectEmployee"
                    ></v-text-field>

                    <v-text-field
                        label="Employee title"
                        dense
                        outlined
                        v-model="position"
                    ></v-text-field>

                    <v-autocomplete
                        :items="formAItems"
                        item-text="display_name"
                        item-value="_id"
                        label="Form A Position"
                        dense
                        outlined
                        v-model="formAId"
                        return-object
                    ></v-autocomplete>

                    <employee-lookup
                        actionName="Select"
                        label="Supervisor : "
                        :select="pickSupervisor"
                        v-if="!selectedSupervisor.email"
                    ></employee-lookup>

                    <v-text-field
                        v-model="selectedSupervisor.display_name"
                        readonly
                        dense
                        outlined
                        label="Supervisor"
                        append-icon="mdi-lock"
                        v-if="selectedSupervisor.email"
                        append-outer-icon="mdi-close-circle"
                        @click:append-outer="unselectSupervisor"
                    ></v-text-field>

                    <v-text-field
                        label="Supervisor title"
                        dense
                        outlined
                        v-model="supervisorTitle"
                    ></v-text-field>

                    <div>
                        <v-btn
                            @click="doCreate"
                            color="primary"
                            class="float-left"
                            :disabled="!isValid"
                            >Add</v-btn
                        >
                        <v-btn
                            @click="show = false"
                            color="secondary"
                            class="float-right"
                            >Close</v-btn
                        >
                    </div>
                    <div style="clear: both"></div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import EmployeeLookup from "@/modules/employee/components/employeeLookup.vue";

export default {
    name: "CreateFormB",
    props: { department: Object },
    components: { EmployeeLookup },
    data: () => ({
        show: false,
        formAItems: [],

        isEmployeeLoading: false,
        employeeItems: [],
        employeeSearch: "",

        isSupervisorLoading: false,
        supervisorItems: [],
        supervisorSearch: "",

        employeeId: "",
        supervisorId: "",
        formAId: "",
        position: "",

        selectedEmployee: {},
        selectedSupervisor: {},
        supervisorTitle: "",
    }),
    computed: {
        isValid() {
            if (
                this.selectedEmployee.email &&
                this.selectedSupervisor.email &&
                this.formAId &&
                this.position.length > 0
            )
                return true;

            return false;
        },
    },
    watch: {
        employeeSearch(val) {
            // Items have already been loaded
            if (val && val.length == 0) return;
            //if (this.employeeItems && this.employeeItems.length > 0) return;

            // Items have already been requested
            if (this.isEmployeeLoading) return;

            this.isEmployeeLoading = true;

            // Lazily load input items
            this.searchEmployees({ terms: val })
                .then((res) => {
                    this.employeeItems = res;
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => (this.isEmployeeLoading = false));
        },
        supervisorSearch(val) {
            // Items have already been loaded
            if (!val || val.length == 0) return;
            //if (this.supervisorItems && this.supervisorItems.length > 0) return;

            // Items have already been requested
            if (this.isSupervisorLoading) return;

            this.isSupervisorLoading = true;

            // Lazily load input items
            this.searchEmployees({ terms: val })
                .then((res) => {
                    this.supervisorItems = res;
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => (this.isSupervisorLoading = false));
        },
    },

    mounted: async function () {},
    methods: {
        ...mapActions("department", ["getAll", "getFormAList"]),
        ...mapActions("employee", ["searchEmployees"]),
        ...mapActions("forms/formB", ["createFormB"]),
        async doShow() {
            this.selectedEmployee = {};
            this.selectedSupervisor = {};
            this.supervisorId = "";
            this.formAId = "";
            this.position = "";
            this.supervisorTitle = "";

            let formAItems = await this.getFormAList({
                id: this.department.dept,
            });
            this.formAItems = formAItems.map((i) => {
                return Object.assign(i, {
                    display_name: `${i.program_branch} / ${i.position}`,
                });
            });
        },
        async doCreate() {
            let lines = [];

            for (let line of this.formAId.authority_lines) {
                lines.push({
                    coding: line.coding,
                    s24_procure_goods_limit: line.contracts_for_goods_services,
                    s24_procure_services_limit:
                        line.contracts_for_goods_services,
                    s24_procure_request_limit: line.request_for_goods_services,
                    s24_procure_assignment_limit: line.assignment_authority,
                    s23_procure_goods_limit: line.contracts_for_goods_services,
                    s23_procure_services_limit:
                        line.contracts_for_goods_services,
                    s24_transfer_limit: line.transfer_payments,
                    s23_transfer_limit: line.transfer_payments,
                    s24_travel_limit: line.authorization_for_travel,
                    other_limit: "",
                    loans_limit: line.loans_and_guarantees,
                    trust_limit: "",
                    s29_performance_limit: line.s29_performance_limit,
                    s30_payment_limit: line.s30_payment_limit,
                });
            }

            let resp = await this.createFormB({
                department_code: this.formAId.department_code,
                department_descr: this.formAId.department_descr,
                employee: {
                    name: this.selectedEmployee.display_name,
                    title: this.position,
                    upn: this.selectedEmployee.userPrincipalName,
                    email: this.selectedEmployee.email,
                    ynet_id: this.selectedEmployee.ynet_id
                },
                supervisor: {
                    name: this.selectedSupervisor.display_name,
                    title: this.supervisorTitle,
                    upn: this.selectedSupervisor.userPrincipalName,
                    email: this.selectedSupervisor.email,
                    ynet_id: this.selectedSupervisor.ynet_id
                },
                program_branch: this.formAId.program_branch,
                form_a_id: this.formAId._id,
                authority_lines: lines,
            });

            this.$router.push(`/form-b/${resp.data._id}`);

            this.show = false;
        },
        pickEmployee(item) {
            this.selectedEmployee = item;
            this.position = this.selectedEmployee.title;
        },
        unselectEmployee() {
            this.selectedEmployee = {};
        },
        pickSupervisor(item) {
            this.selectedSupervisor = item;
            this.supervisorTitle = this.selectedSupervisor.title;
        },
        unselectSupervisor() {
            this.selectedSupervisor = {};
        },
    },
};
</script>