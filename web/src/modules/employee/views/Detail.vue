<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template slot="left">
        <div class="display: inline-block">
          Employee details for {{ employee.name }}<br />

          <span style="font-size: 90%; color: rgba(0,0,0,.6)">
            YNET Id: <strong>{{ employee.ynet_id }}</strong> &nbsp; &nbsp; Email:
            <a :href="`mailto:${employee.email}`"
              ><strong>{{ employee.email }}</strong></a
            ></span
          >
        </div>
      </template>

      <v-row>
        <v-col cols="12">
          <v-card class="default">
            <v-card-title>Authority History</v-card-title>
            <v-card-text>
              <v-data-table
                :items="employee.authorities"
                :headers="[
                  { text: 'Status', value: 'status' },
                  { text: 'Department', value: 'department_descr' },
                  { text: 'Program', value: 'program' },
                  { text: 'Type', value: 'type' },
                  { text: 'Position', value: 'employee.title' },
                  { text: 'Form A', value: 'formA' },
                  { text: 'Form B', value: 'formB' },
                ]"
                @click:row="openFormB"
              >
                <template v-slot:item.type="{ item }">
                  {{ cleanType(item.authority_type) }}
                </template>
                <template v-slot:item.program="{ item }">
                  {{ item.program_branch }} <span v-if="item.activity">: {{ item.activity }}</span>
                </template>
                <template v-slot:item.formA="{ item }">
                  <v-btn icon color="primary" class="my-0" @click.stop="showFormAPdf(item)"
                    ><v-icon>mdi-file-pdf-box</v-icon></v-btn
                  >
                </template>
                <template v-slot:item.formB="{ item }">
                  <v-btn icon color="primary" class="my-0" @click.stop="showFormBPdf(item)"
                    ><v-icon>mdi-file-pdf-box</v-icon></v-btn
                  >
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { AUTHORITY_URL } from "@/urls";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";

export default {
  components: { PdfPreviewDialog },
  computed: {
    ...mapState("department", ["departments"]),
    ...mapGetters("employee", ["employee"]),
    breadcrumbs: function() {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.employee.name}`,
      });
      return b;
    },
    employee_department_name: function() {
      return this.departments.find((d) => d.dept === this.employee.primary_department);
    },
  },
  watch: {},
  data: () => ({
    page: { title: "Employee" },
  }),
  async mounted() {
    this.loadEmployee(this.$route.params.id);
  },
  methods: {
    ...mapActions("employee", ["loadEmployee"]),

    showFormAPdf(item) {
      if (item && item.form_a && item.form_a.activation)
        this.$refs.pdfPreview.show("Signed Form A", `${AUTHORITY_URL}/uploads/${item.form_a.activation.file_id}/file`);
      else console.log("No form attached");
    },
    showFormBPdf(item) {
      if (item.upload_signatures) {
        this.$refs.pdfPreview.show("Signed Form B", `${AUTHORITY_URL}/uploads/${item.upload_signatures.file_id}/file`);
      } else {
        this.$refs.pdfPreview.show("Form B Preview", `${AUTHORITY_URL}/${item._id}/pdf`);
      }
    },
    openFormB(item) {
      console.log("OPENING ITEM", item);
      this.$router.push(`/form-b/${item._id}`);
    },
    cleanType(value) {
      if (value == "substantive") return "Substantive Position";
      else if (value == "temporary") return "Temporary";
      if (value == "acting") return "Acting Assignment";
    },
  },
};
</script>
