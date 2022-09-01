
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

        <BaseCard
            :showHeader="true"
            :heading="`Form B for ${formB.employee.name}`"
        >
            <template slot="right">
                <form-b-status :isLocked="isLocked" :isActive="isActive">
                </form-b-status>
                <actions-menu> </actions-menu>
            </template>

            <v-stepper value="2" elevation="0" outlined>
                <v-stepper-header>
                    <v-stepper-step step="1" complete> Draft </v-stepper-step>
                    <v-divider></v-divider>

                    <v-stepper-step step="2">
                        Department Review
                    </v-stepper-step>
                    <v-divider></v-divider>

                    <v-stepper-step step="3"> Finance Review </v-stepper-step>
                    <v-divider></v-divider>

                    <v-stepper-step step="4"> Signatures </v-stepper-step>
                    <v-divider></v-divider>

                    <v-stepper-step step="5"> Active </v-stepper-step>
                </v-stepper-header>
            </v-stepper>

            <v-card class="default mt-4">
                <v-card-text>
                    <form-b-table></form-b-table>
                </v-card-text>
            </v-card>

            <authority-metadata-card :formB="formB" class="mt-4" />

            <v-row class="mt-3">
                <v-col>
                    <v-card class="default">
                        <v-card-title>Related Form A</v-card-title>
                        <v-card-text>
                            <v-text-field
                                v-model="formB.form_a.program_branch"
                                label="Program"
                                dense
                                outlined
                                background-color="white"
                                readonly
                                append-icon="mdi-lock"
                            ></v-text-field>
                            <v-text-field
                                v-model="formB.form_a.activity"
                                label="Activity"
                                dense
                                outlined
                                readonly
                                background-color="white"
                                append-icon="mdi-lock"
                            ></v-text-field>
                            <v-text-field
                                v-model="formB.form_a.position"
                                label="Position"
                                dense
                                outlined
                                readonly
                                background-color="white"
                                append-icon="mdi-lock"
                            ></v-text-field>

                            <v-btn
                                color="primary"
                                small
                                class="my-0"
                                @click="
                                    $router.push(
                                        `/departments/${formB.department_code}/form-a/${formB.form_a_id}`
                                    )
                                "
                                >View details</v-btn
                            >
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card class="default">
                        <v-card-title>Audit History</v-card-title>
                        <v-card-text>
                            <v-data-table
                                dense
                                :headers="[
                                    { text: 'Date', value: 'date_display' },
                                    { text: 'User', value: 'user_name' },
                                    { text: 'Action', value: 'action' },
                                ]"
                                :items="formB.audit_lines"
                                :sort-by="['date']"
                                :sort-desc="[true]"
                            />
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </BaseCard>
    </v-container>
</template>

<script>
// import { AUTHORITY_URL } from "@/urls";
import { mapGetters, mapActions } from "vuex";

// import uploadFormModal from "../components/uploadFormModal.vue";
import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";
import FormBStatus from "../components/status/formBStatus.vue";
import actionsMenu from "../components/menus/actionsMenu.vue";
import FormBTable from "../components/formBTable.vue";

export default {
    name: "AuthorityDetails",
    components: {
        // uploadFormModal,
        AuthorityMetadataCard,
        FormBStatus,
        actionsMenu,
        FormBTable,
    },
    data: () => ({
        id: "",
        authority: {},
        showUpload: false,
        page: { title: "" },
        isLocked: false,
        isActive: true,
    }),
    computed: {
        ...mapGetters("authority/formB", ["formB"]),

        breadcrumbs: function () {
            let b = [{ text: "Dashboard", to: "/dashboard" }];
            b.push({
                text: `${this.formB.employee.name}`,
                to: `/employee/${this.formB.employee.ynet_id}`,
            });
            b.push({
                text: `${this.formB.department_descr} / ${this.formB.program_branch} / ${this.formB.employee.title}`,
            });
            return b;
        },
    },
    async mounted() {
        this.id = this.$route.params.formBId;
        this.loadFormB(this.id);
        this.page.title = "Form B Details";
    },
    methods: {
        ...mapActions("authority/formB", ["loadFormB"]),
    },
};
</script>
<style scoped>
.table {
    border-collapse: collapse;
}
.table th {
    text-align: center;
}
.table thead {
    text-transform: uppercase;
}
.table th,
.table td {
    border: 1px black solid;
}

.table th.rotate {
    height: 140px;
    white-space: nowrap;
    vertical-align: bottom;
    padding-bottom: 20px;
}

.table th.rotate > div {
    transform: rotate(270deg);
    width: 58px;
}
.table .fb-value {
    width: 60px;
    text-align: center;
}
</style>