
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Form B for {{ employeeFullName }}</h1>
    <v-row>
      <v-col>
        <authority-metadata-card :formB="formB" @close="close" />
      </v-col>
    </v-row>
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
                    rowspan="5"
                    style="
                      text-align: left;
                      padding: 10px;
                      vertical-align: top;
                      height: 190px;
                    "
                  >
                    <h3>Delegate:</h3>

                    <v-text-field
                      v-model="employeeFullName"
                      readonly
                      dense
                      outlined
                      label="Public Officer Name"
                      @change="itemChanged"
                    ></v-text-field>

                    <v-select
                      :items="departments"
                      dense
                      outlined
                      item-text="name"
                      item-value="_id"
                      v-model="formB.department_id"
                      label="Department"
                      @change="itemChanged"
                    ></v-select>
                    <v-text-field
                      v-model="formB.program"
                      dense
                      outlined
                      label="Program/Branch"
                      @change="itemChanged"
                    ></v-text-field>
                    <v-text-field
                      v-model="formB.title"
                      dense
                      outlined
                      label="Position title"
                      @change="itemChanged"
                    ></v-text-field>
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
                    Area of Authority - General Ledger Coding
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(line, idx) of formB.authority_lines" :key="idx">
                  <td class="">
                    <v-text-field
                      v-model="line.account"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                      prepend-inner-icon="mdi-delete"
                      @click:prepend-inner="removeLine(idx)"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_procure_goods_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_procure_services_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_procure_request_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_procure_assignment_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s23_procure_goods_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s23_procure_services_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_transfer_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s23_transfer_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s24_travel_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.other_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.loans_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.trust_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s29_performance_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
                  <td class="fb-value">
                    <v-text-field
                      v-model="line.s30_payment_limit"
                      dense
                      filled
                      hide-details
                      @change="itemChanged"
                    ></v-text-field>
                  </td>
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


<script>
import { mapGetters, mapActions } from "vuex";
import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    AuthorityMetadataCard,
  },
  data: () => ({
    id: "",

    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapGetters("authority", ["formB"]),
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
    ...mapActions("authority", ["loadFormB", "saveFormB"]),
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