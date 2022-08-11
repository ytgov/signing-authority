
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

        <form-b-status
          :isLocked="isLocked"
          :isActive="isActive">
        </form-b-status>
        <actions-menu> </actions-menu>

      </template>

      <authority-metadata-card :formB="formB" />

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-text>
             <form-b-table></form-b-table>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :to="{
                  name: 'EmployeeDetail',
                  params: { id: formB.employee.ynet_id },
                }"
                color="#7A9A01"
                >Close</v-btn
              >
            </v-card-actions>
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
import FormBStatus from "../components/status/formBStatus.vue"
import actionsMenu from "../components/menus/actionsMenu.vue";
import FormBTable from '../components/formBTable.vue';

export default {
  name: "AuthorityDetails",
  components: {
    // uploadFormModal,
    AuthorityMetadataCard,
    FormBStatus,
    actionsMenu,
    FormBTable
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
    ...mapActions("authority/formB", ["loadFormB" ]),


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