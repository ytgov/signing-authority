<template>
    <v-dialog v-model="dialog" max-width="600px" persistent>
        <template v-slot:activator="{ on, attrs }">
            <v-list-item-title v-bind="attrs" v-on="on">
                Archive Form A
            </v-list-item-title>
            <!-- <v-btn color="primary" v-bind="attrs" v-on="on">Archive Form A</v-btn> -->
        </template>
        <v-app-bar dark color="#0097A9">
            <v-toolbar-title> Archive Form A </v-toolbar-title>
            <v-spacer />
            <v-icon title="Close" @click="dialog = false">mdi-close</v-icon>
        </v-app-bar>
        <v-card tile>
            <v-card-text class="pt-6">
                <v-text-field
                    label="Position"
                    :value="`${formA.program_branch}: ${formA.position}`"
                    readonly
                    dense
                    outlined
                    append-icon="mdi-lock"
                ></v-text-field>

                <v-text-field
                    v-model="archiveDetails.reason"
                    dense
                    outlined
                    label="Reason for archiving"
                ></v-text-field>
                <div class="text-error">* This action cannot be undone.</div>
            </v-card-text>

            <v-card-actions>
                <v-btn @click="doArchive" color="error">Archive</v-btn>
                <v-spacer />
                <v-btn @click="dialog = false" color="secondary">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
    name: "archiveFormA",
    props: {},
    data: () => ({
        dialog: false,
        archiveDetails: {
            reason: "Staff Change",
        },
        deptId: null,
    }),
    computed: {
        ...mapState("authority/formA", ["formA"]),
    },
    methods: {
        ...mapActions("authority/formA", ["archiveFormA"]),

        doArchive: async function () {
            await this.archiveFormA(this.archiveDetails);
            this.$router.push(`/departments/${this.deptId}/form-a`);
        },
    },
    async mounted() {
        this.deptId = this.formA.department_code;
    },
};
</script>