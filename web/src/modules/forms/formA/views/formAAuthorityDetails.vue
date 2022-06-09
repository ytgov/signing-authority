
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
            <table
              border="0"
              cellspacing="0"
              cellpadding="0"
              class="table"
              style="background-color: white; width: 100%; text-align: left"
            >
              <thead>
                <tr>
                  <th
                    colspan="2"
                    rowspan="5"
                    style="text-align: left; padding: 10px; vertical-align: middle"
                  >


                    Department:<br />
                    <strong>{{ formB.department.name }}</strong>
                    <br /><br />
                    Program/Branch:<br />
                    <strong>{{ formB.program }}</strong>

                  </th>
                  <th colspan="13">SPENDING AUTHORITY</th>
                  <th rowspan="3" class="rotate" style="height: 140px">
                    <div>
                      PAYMENT<br />
                      AUTHORITY s.30
                    </div>
                  </th>
                </tr>
                <tr>
                  <th colspan="6">PROCUREMENT</th>
                  <th rowspan="2" colspan="2" style="max-width: 80px">
                    TRANSFER PAYMENTS
                  </th>
                  <th colspan="4" rowspan="2">
                    OTHER:<br />S.24 COMMITMENT & <br />S.23 SIGNING CONTRACT
                  </th>
                  <th rowspan="2">S.29</th>
                </tr>
                <tr>
                  <th colspan="4">S.24 Commitment</th>
                  <th colspan="2" style="max-width: 80px">
                    S.23 Signing Contract
                  </th>
                </tr>
                <tr>
                  <th colspan="2" style="max-width: 80px">OWN PROCUREMENT</th>
                  <th rowspan="3" class="rotate">
                    <div>
                      Request for goods<br />
                      or services
                    </div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>Assignment <br />Authority</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div class="mb-2">Goods</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div class="mb-2">Services</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div class="mb-2">S.24 Commitment</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>S.23 Signing<br />contract</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>S.24 Travel <br />authorization</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>OTher contracts & <br />Expenditures **</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>Loans & <br />Guarantees</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div class="mb-2">Departmental Use</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>Certificate of <br />performance</div>
                  </th>
                  <th rowspan="3" class="rotate">
                    <div>
                      Requesition<br />
                      for payment
                    </div>
                  </th>
                </tr>
                <tr>
                  <th class="rotate" rowspan="2">
                    <div class="mb-2">Goods</div>
                  </th>
                  <th class="rotate" rowspan="2">
                    <div class="mb-2">Services</div>
                  </th>
                </tr>
                <tr style="height: 30px">
                  <th style="height: 30px">
                    Position
                  </th>
                  <th style="height: 30px px-3">
                    Area of Authority
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(line, idx) of formB.authority_lines" :key="idx">
                  <td class=" px-3">Director of Super Cool Programs</td>
                  <td class="pl-3">{{ line.account }}</td>
                  <td class="fb-value">{{ line.s24_procure_goods_limit }}</td>
                  <td class="fb-value">
                    {{ line.s24_procure_services_limit }}
                  </td>
                  <td class="fb-value">
                    {{ line.s24_procure_request_limit }}
                  </td>
                  <td class="fb-value">
                    {{ line.s24_procure_assignment_limit }}
                  </td>
                  <td class="fb-value">
                    {{ line.s23_procure_goods_limit }}
                  </td>
                  <td class="fb-value">
                    {{ line.s23_procure_services_limit }}
                  </td>
                  <td class="fb-value">{{ line.s24_transfer_limit }}</td>
                  <td class="fb-value">{{ line.s23_transfer_limit }}</td>
                  <td class="fb-value">{{ line.s24_travel_limit }}</td>
                  <td class="fb-value">{{ line.other_limit }}</td>
                  <td class="fb-value">{{ line.loans_limit }}</td>
                  <td class="fb-value">{{ line.trust_limit }}</td>
                  <td class="fb-value">{{ line.s29_performance_limit }}</td>
                  <td class="fb-value">{{ line.s30_payment_limit }}</td>
                </tr>
              </tbody>
            </table>

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
                name: 'EmployeeDetail',
                params: { id: formB.employee._id },
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
import { mapGetters, mapActions } from "vuex";

// import uploadFormModal from "../components/uploadFormModal.vue"
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    // uploadFormModal,
    // AuthorityMetadataCard,
  },
  data: () => ({
    id: "",
    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),

    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.formB.employee.first_name} ${this.formB.employee.last_name}`,
        to: `/employee/${this.formB.employee_id}`,
      });
      b.push({
        text: `Form B (${this.formB.department.name} - ${this.formB.program})`,
      });
      return b;
    },
  },
  async mounted() {
    this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
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