
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>
      Form B for {{ formB.employee.first_name }} {{ formB.employee.last_name }}
    </h1>

    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-title> Future Home of Viewing a Signing Auth</v-card-title>
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
                  <th rowspan="5"></th>
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
                  <th colspan="4">S.24 Comitment</th>
                  <th colspan="2" style="max-width: 80px">
                    S.23 Signing Contract
                  </th>
                </tr>
                <tr>
                  <th colspan="2" style="max-width: 80px">OWN PROCUREMENT</th>
                  <th rowspan="2" class="rotate">
                    <div>Request for goods</div>
                  </th>
                  <th rowspan="2" class="rotate"><div>Assignent Auth</div></th>
                  <th rowspan="2" class="rotate"><div>Goods</div></th>
                  <th rowspan="2" class="rotate"><div>Services</div></th>
                  <th rowspan="2" class="rotate"><div>S.24 Commitment</div></th>
                  <th rowspan="2" class="rotate">
                    <div>S.23 Signing contract</div>
                  </th>
                  <th rowspan="2" class="rotate">
                    <div>S.24 Travel auth</div>
                  </th>
                  <th rowspan="2" class="rotate"><div>OTher contrat</div></th>
                  <th rowspan="2" class="rotate"><div>Loans</div></th>
                  <th rowspan="2" class="rotate"><div>Departmental</div></th>
                  <th rowspan="2" class="rotate"><div>Cert of perform</div></th>
                  <th rowspan="2" class="rotate">
                    <div>Requesition for payment</div>
                  </th>
                </tr>
                <tr>
                  <th class="rotate"><div>Goods</div></th>
                  <th class="rotate"><div>Services</div></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, idx) of formB.authority_lines" :key="idx">
                  <td>{{ line.account }}</td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
                  <td style="width: 60px"></td>
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
            <v-btn color="primary" class="mx-5">
              Create New Signing Auths</v-btn
            >
        <v-btn color="error" class="mr-5">Archive</v-btn>
        <v-btn color="info" class="mr-5">Make changes</v-btn>

            <v-btn color="primary" class="mx-5"> Create PDF </v-btn>
            <v-spacer />
            <v-btn color="secondary" class="mx-5"> Upload PDF </v-btn>
            <v-btn color="secondary" class="mx-5"> View PDF </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.table {
  border-collapse: collapse;
}
.table th {
  text-align: center;
}
.table th,
.table td {
  border: 1px black solid;
}

.table th.rotate {
  height: 170px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
}

.table th.rotate > div {
  transform: rotate(270deg);
  width: 58px;
}
</style>


<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AuthorityDetails",
  data: () => ({
    id: "",
    authority: {},
  }),
  computed: {
    ...mapGetters("authority", ["formB"]),
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.formB.employee.first_name} ${this.formB.employee.last_name}`,
        to: `/employee/${this.formB.employee_id}`,
      });
      b.push({ text: `Form B (${this.formB.department.name} - ${this.formB.program})` });
      return b;
    },
  },
  async mounted() {
    this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
  },
  methods: {
    ...mapActions("authority", ["loadFormB"]),
  },
};
</script>