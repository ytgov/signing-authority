<template>
    <div>
        <!-- <v-toolbar color="#244C5A" dark>
    <v-toolbar-title>
      Supervisor: {{formB.supervisor_name}}, {{formB.supervisor_title}}
    </v-toolbar-title>
    <v-spacer></v-spacer>
     <v-icon @click="$emit('close')">mdi-close</v-icon>
  </v-toolbar> -->
        <v-row>
            <v-col>
                <v-card class="default">
                    <v-card-title>Supervisor</v-card-title>
                    <v-card-text>
                        <v-text-field
                            v-model="formB.supervisor.name"
                            label="Name"
                            dense
                            outlined
                            background-color="white"
                            readonly
                            append-icon="mdi-lock"
                        ></v-text-field>
                        <v-text-field
                            v-model="formB.supervisor.title"
                            label="Title"
                            dense
                            outlined
                            background-color="white"
                            readonly
                            append-icon="mdi-lock"
                        ></v-text-field>
                        <v-text-field
                            v-model="formB.supervisor.signed_date"
                            label="Signed on"
                            dense
                            outlined
                            background-color="white"
                            readonly
                            append-icon="mdi-lock"
                            hide-details
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col v-if="formB.activation">
                <v-card class="default">
                    <v-card-title>Cancelling Information</v-card-title>
                    <v-card-text>
                        <v-text-field
                            label="Date Cancelled"
                            dense
                            outlined
                            background-color="white"
                            v-model="formB.date_cancelled"
                        >
                            {{ formB.date_cancelled }}
                        </v-text-field>
                        <v-select
                            label="Reason for Cancelling"
                            dense
                            outlined
                            background-color="white"
                            :items="cancelledReasons"
                            v-model="formB.reason_for_cancelling"
                            hide-details
                        >
                        </v-select>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col>
                <v-card class="default">
                    <v-card-title>Review</v-card-title>
                    <v-card-text>
                        <v-text-field
                            label="Issue date"
                            dense
                            outlined
                            background-color="white"
                            v-model="formB.issue_date"
                        >
                        </v-text-field>
                        <v-text-field
                            label="Expiry date"
                            dense
                            outlined
                            background-color="white"
                            v-model="formB.issue_date"
                        >
                        </v-text-field>
                        <v-checkbox
                            class="my-0"
                            label="Activated by Memo"
                            value="formB.activated_by_memo"
                            hide-details
                        >
                        </v-checkbox>

                        <v-checkbox
                            class="my-0 py-0"
                            label="Reviewed by Department"
                            v-model="formB.reviewed_by_department"
                        >
                        </v-checkbox>
                        <v-checkbox
                            class="my-0 py-0"
                            label="Signed by Employee"
                            hide-details
                            v-model="formB.employee_signed"
                        >
                        </v-checkbox>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: "authorityMetaDataCard",

    props: {
        formB: {
            type: Object,
        },
    },
    data: () => ({
        cancelledReasons: [
            "Departed Substantive Role",
            "Expired",
            "Cancelled",
            "Suspended",
        ],
    }),
};
</script>

<style>
</style>