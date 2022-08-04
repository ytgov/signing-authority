<template>
    <v-dialog v-model="show" persistent width="600">
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
                @click="doShow"
                >Add Position</v-btn
            >
        </template>

        <v-app-bar dark color="#0097A9">
            <v-toolbar-title>Add Form A Position</v-toolbar-title>
            <v-spacer />
            <v-icon title="Close" @click="show = false">mdi-close</v-icon>
        </v-app-bar>
        <v-card tile>
            <v-card-text class="mt-5 pb-0">
                <v-text-field
                    label="Department"
                    readonly
                    :value="department.display_name"
                    dense
                    outlined
                    append-icon="mdi-lock"
                ></v-text-field>

                <v-text-field
                    label="Program / Branch"
                    dense
                    outlined
                    v-model="newFormA.program_branch"
                ></v-text-field>
                <v-text-field
                    label="Position"
                    dense
                    outlined
                    v-model="newFormA.position"
                    required
                ></v-text-field>

                <div>
                    <v-btn
                        @click="doCreate"
                        color="primary"
                        class="float-left"
                        :disabled="newFormA.position.length == 0"
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
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "CreateFormAButton",
    props: {
        department: {
            type: Object,
            required: true,
        },
    },
    data: () => ({
        //see <projectroot>/api/data/models/formA.ts for details
        show: false,
        newFormA: {
            department_code: "Empty",
            department_descr: "Empty",
            position: "",
            program_branch: "",
            authority_lines: [],
        },
    }),
    methods: {
        ...mapActions("authority/formA", ["createFormA"]),

        async doShow() {
            this.newFormA.department_code = this.department.dept;
            this.newFormA.department_descr = this.department.descr;
            this.newFormA.program_branch = "";
            this.newFormA.position = "";
        },

        async doCreate() {
            console.log(this.newFormA);

            let createResponse = await this.createFormA(this.newFormA);
            this.$router.push(
                `/departments/${this.newFormA.department_code}/form-a/${createResponse._id}/edit`
            );
        },
    },
};
</script>

