
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Form A for {{ formA.program_branch }}</h1>
    <!-- <v-row>
      <v-col>
        <authority-metadata-card :formB="formB" @close="close" />
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-text>
             <table
              border="0"
              cellspacing="0"
              cellpadding="0"
              class="table"
              style="background-color: white; width: 100%; text-align: left"
            >
            <thead>
      <tr>
        <th colspan="3" rowspan="4"
          style="text-align: left; padding: 10px; vertical-align: middle">
            Department:<br />
              <strong>{{ formA.department_descr }}</strong>
              <br /> <br /> <br />
              Program/Branch:<br />
              <strong>{{ formA.program_branch }}</strong>
              <br/>
        </th>
        <th colspan="7" style="height: 80px">
          SPENDING AUTHORITY
        </th>
        <th rowspan="5" class="rotate" style="height: 140px">
          <div class="mb-2">
            PAYMENT<br />
            AUTHORITY s.30
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6" style="height: 80px">
          SECTION 23 and SECTION 24 ($000)
        </th>
        <th rowspan="4" class="rotate">
          <div class="ml-2">(SECTION 29) <br />
            CERTIFICATE OF <br />PERFORMANCE
          </div>
       </th>
      </tr>
      <tr>
        <!-- <th colspan="2" rowspan="2"  style="text-align: left; padding: 10px; vertical-align: middle">
          Program/Branch:<br />
              <strong>{{ formA.program }}</strong>B</th> -->
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">
            CONTRACTS FOR <br />GOODS OR SERVICES
          </div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">LOANS & <br />GUARANTEES </div>
        </th>
        <th rowspan="3" class="rotate" style= "">
           <div class="mb-2">Transfer <br/> Payments</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">AUTHORIZATION <br />FOR TRAVEL</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">REQUEST FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
           <div class="mb-2">ASSIGNMENT <br />AUTHORITY</div></th>
      </tr>
      <tr>
      </tr>
      <tr>
        <th class="bottom" style= " ">
              <div>POSITION</div>
            </th>
            <th class="bottom">
              AREA OF <br />AUTHORITY
            </th>
             <th class="bottom">
              OPERATIONAL <br />RESTRICTIONS
            </th>
      </tr>

    </thead>
            <form-a-table-body-edit
            :formA="formA"> </form-a-table-body-edit>
            </table>
            <!-- <formATable
            :formA = "formA"
            :edit="edit">
            </formATable> -->


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
import { mapGetters, mapActions, mapState } from "vuex";
import FormATableBodyEdit from '../components/formATableBodyEdit.vue';
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";
// import { formATable } from "../components/formATable.vue"

export default {
  name: "AuthorityDetails",
  components: {
    FormATableBodyEdit
    // AuthorityMetadataCard,
    // formATable
  },
  data: () => ({

    edit: true,
    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapState("authority/formA", ["formA"]),
    ...mapGetters("department", ["departments"]),
    // employeeFullName: function () {
    //   return `${this.formB.employee.first_name} ${this.formB.employee.last_name}`;
    // },
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `Form A: ${this.formA.department_descr} - ${this.formA.program_branch})`,
        to: `/form-a/${this.formA._id}`,
        exact: true,
      });
      b.push({ text: "Edit" });
      return b;
    },
  },
  async mounted() {
    this.loadFormA(this.$route.params.id);
  },
  methods: {
    ...mapActions("authority/formA", ["loadFormA", "saveFormA"]),

    addLine() {
      this.formA.authority_lines.push({});
    },
    removeLine(idx) {
      this.formA.authority_lines.splice(idx, 1);
      this.saveFormB(this.formA);
    },
    itemChanged() {
      this.saveFormA(this.formA);
    },
    close() {
      this.$router.push(`/form-a/${this.formA._id}`)
    },
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
  height: 200px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
  max-width: 80px;
}
table th.bottom {
  white-space: nowrap;
  vertical-align: bottom;
  width: 175px;
  padding-left: 10px;
  text-align: left;
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