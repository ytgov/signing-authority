
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>


    <h1>
     Delegation of Financial Signing Authority Chart
    </h1>

    <!-- <authority-metadata-card :formB="formB" /> -->

    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-text>
            <formATable
             :formA = "formA"></formATable>

            <!--   <v-data-table style="font-size: .5rem !important"
            dense
            :headers="[{text:'Account', value:'account'}, {text: 'S23 Goods', value:'s24_procure_goods_limit'}]"
            :items="formB.authority_lines"></v-data-table>

-->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :to="{
                name: 'DepartmentDetail',
                params: { id: formA.department.id },
              }"
              color="#7A9A01"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog></v-dialog>
  </div>
</template>




<script>
import { AUTHORITY_URL } from "@/urls";
// import { mapGetters, mapActions } from "vuex";
import formATable from  "../components/formATable.vue"

// import uploadFormModal from "../components/uploadFormModal.vue"
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    formATable
    // uploadFormModal,
    // AuthorityMetadataCard,
  },
  data: () => ({
    id: "",
    authority: {},
    showUpload: false,
    formA: {
      department: {
        name: "Finance",
        id: "12"
      },
      program: "Taxation"
    },
    formB: {
      employee: {
        _id: "123",
        first_name: "Test",
        last_name: "User"
      }
    }
  }),
  computed: {
    // ...mapGetters("authority/formB", ["formB"]),

    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.formB.employee.first_name} ${this.formB.employee.last_name}`,
        to: `/employee/${this.formB.employee._id}`,
      });
      b.push({
        text: `Form A (${this.formA.department.name} - ${this.formA.program})`,
      });
      return b;
    },
  },
  async mounted() {
    // this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
  },
  methods: {
    // ...mapActions("authority/formB", ["loadFormB", "downloadFormB"]),
    editClick() {
      //TODO: this should check the state to determine if changes are allowed
      this.$router.push(`/form-a/${this.id}/edit`);
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
