
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Form A for {{ Position }}</h1>
    <!-- <v-row>
      <v-col>
        <authority-metadata-card :formB="formB" @close="close" />
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-text>
            <formATable
            :formA = "formA">
            </formATable>


            <!--   <v-data-table style="font-size: .5rem !important"
            dense
            :headers="[{text:'Account', value:'account'}, {text: 'S23 Goods', value:'s24_procure_goods_limit'}]"
            :items="formB.authority_lines"></v-data-table>

-->
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="addLine">Add line</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="#7A9A01" @click="close">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog></v-dialog>
  </div>
</template>



<script>
// import { mapGetters, mapActions } from "vuex";
import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";
import { formATable } from "../components/formATable.vue"

export default {
  name: "AuthorityDetails",
  components: {
    AuthorityMetadataCard,
    formATable
  },
  data: () => ({
    id: "",

    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),
    ...mapGetters("department", ["departments"]),
    employeeFullName: function () {
      return `${this.formB.employee.first_name} ${this.formB.employee.last_name}`;
    },
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.formB.employee.first_name} ${this.formB.employee.last_name}`,
        to: `/employee/${this.formB.employee_id}`,
      });
      b.push({
        text: `Form B (${this.formB.department.name} - ${this.formB.program})`,
        to: `/form-b/${this.formB._id}`,
        exact: true,
      });
      b.push({ text: "Edit" });
      return b;
    },
  },
  async mounted() {
    this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
  },
  methods: {
    ...mapActions("authority/formB", ["loadFormB", "saveFormB"]),

    addLine() {
      this.formB.authority_lines.push({});
    },
    removeLine(idx) {
      this.formB.authority_lines.splice(idx, 1);
      this.saveFormB(this.formB);
    },
    itemChanged() {
      this.saveFormB(this.formB);
    },
    close() {
      this.$router.push(`/form-b/${this.id}`);
    },
  },
};
</script>