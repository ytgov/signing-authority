<template>
    <v-dialog persistent v-model="showDialog" width="600">
        <v-app-bar dark color="#0097A9">
            <v-toolbar-title>Edit User</v-toolbar-title>
            <v-spacer />
            <v-icon title="Close" @click="showDialog = false"
                >mdi-close</v-icon
            > </v-app-bar
        ><v-card tile>
            <v-card-text class="mt-5 pb-0">
                <v-text-field
                    v-model="item.display_name"
                    label="Name"
                    dense
                    outlined
                    readonly
                    append-icon="mdi-lock"
                ></v-text-field>
                <v-text-field
                    v-model="item.email"
                    label="Email"
                    dense
                    outlined
                    readonly
                    append-icon="mdi-lock"
                ></v-text-field>
                <v-select
                    label="Status"
                    v-model="item.status"
                    dense
                    outlined
                    :items="['Active', 'Inactive']"
                ></v-select>
                <v-select
                    label="Role"
                    dense
                    outlined
                    v-model="item.roles"
                    :items="roleOptions"
                ></v-select>

                <v-btn @click="save" color="primary">Save</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "UserEdtior",
    props: ["onSave"],
    data: () => ({
        showDialog: false,
        item: {},
        roleOptions: ["Finance Admin", "Department Admin"],
    }),
    methods: {
        ...mapActions("administration", ["saveUser"]),
        show(item) {
            this.item = item;
            this.showDialog = true;
        },
        async save() {
            let resp = await this.saveUser(this.item);
            this.onSave(resp);
            this.showDialog = false;
        },
    },
};
</script>
