<template>
    <div>
        <v-menu offset-y>
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
                <v-list-item v-if="!isLocked" @click="editClick">
                    <v-list-item-title>Edit </v-list-item-title>
                </v-list-item>

                <!--    <v-list-item @click="generateClick">
          <v-list-item-title>Lock for Signatures</v-list-item-title>
        </v-list-item>
 -->
                <!-- <v-list-item @click="uploadClick">
          <-- <upload-form-modal></upload-form-modal> ->
          <v-list-item-title>Upload Signed PDF</v-list-item-title>
        </v-list-item> -->
                <v-list-item v-if="formA.status.indexOf('Archived') == -1">
                    <archive-form-a> </archive-form-a>
                    <!-- <v-list-item-title>Archive</v-list-item-title> -->
                </v-list-item>

                <v-list-item @click="duplicateClick">
                    <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>
<script>
import { mapActions } from "vuex";
import archiveFormA from "./actions/archiveFormA.vue";
export default {
    components: { archiveFormA },
    name: "actionsMenu",
    props: {
        formA: {
            type: Object,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: false,
            default: false,
        },
        isLocked: {
            type: Boolean,
            required: false,
            default: false,
        },
        status: { type: String },
    },
    data() {
        return {
            //
        };
    },
    methods: {
        ...mapActions("authority/formA", ["duplicateFormA"]),
        editClick() {
            this.$router.push(
                `/departments/${this.formA.department_code}/form-a/${this.formA._id}/edit`
            );
        },
        generateClick() {
            this.$router.push({
                name: "FormAGenerate",
                params: { id: this.formA._id },
            });
        },
        uploadClick() {
            this.$router.push({
                name: "FormAUpload",
                params: { id: this.formA._id },
            });
        },

        async duplicateClick() {
            await this.duplicateFormA(); //the await may not be needed but ¯\_(ツ)_/¯
            this.$router.push(
                `/departments/${this.formA.department_code}/form-a/${this.formA._id}/edit`
            );
        },
    },
};
</script>
