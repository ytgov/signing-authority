<template>
    <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="secondary"
                small
                v-bind="attrs"
                v-on="on"
                class="mt-2"
            >
                Actions <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <v-list-item @click="editClick">
                <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>

            <v-list-item @click="generateClick">
                <v-list-item-title>Lock for Signatures</v-list-item-title>
            </v-list-item>

            <v-list-item @click="uploadClick">
                <upload-form-modal></upload-form-modal>
                <!-- <v-list-item-title>Upload Signed PDF</v-list-item-title> -->
            </v-list-item>

            <v-list-item @click="archiveClick">
                <v-list-item-title>Archive</v-list-item-title>
            </v-list-item>

            <v-list-item @click="archiveClick">
                <v-list-item-title>Duplicate</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import { mapState, mapActions } from "vuex";
import uploadFormModal from "../uploadFormModal.vue";

export default {
    name: "actionsMenu",
    components: { uploadFormModal },

    computed: {
        ...mapState("authority/formB", ["formB"]),
    },
    async mounted() {
        this.id = this.$route.params.formBId;
        this.loadFormB(this.id);
    },
    methods: {
        ...mapActions("authority/formB", ["loadFormB", "downloadFormB"]),
        editClick() {
            //TODO: this should check the state to determine if changes are allowed
            this.$router.push(`/form-b/${this.id}/edit`);
        },
        async generateClick() {
            window.open(`${AUTHORITY_URL}/${this.id}/pdf`, "_blank");
            //await this.downloadFormB(this.id);
        },
        uploadClick() {
            this.showUpload = true; //show modal fup upload
        },
        archiveClick() {},
        downloadClick() {},
    },
};
</script>

<style>
</style>