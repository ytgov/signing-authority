<template>
    <div></div>
    <!-- <v-card class="default">
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
                            hide-details
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
            </v-col>-->
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