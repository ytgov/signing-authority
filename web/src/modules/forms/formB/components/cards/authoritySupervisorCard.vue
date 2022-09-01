<template>
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
</template>

<script>
export default {
    name: "authoritySupervisorCard",

    props: {
        formB: {
            type: Object,
        },
    },
    data: () => ({}),
};
</script>
