<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard :showHeader="true" :heading="`Form B for ${formB.employee.name}`">
      <template slot="right">
        <v-btn color="primary" small class="mr-5" text @click="closeClick">Cancel</v-btn>
        <v-btn color="primary" @click="saveClick" :disabled="!canSave">Save</v-btn>
      </template>

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-text>
              <table
                border="0"
                cellspacing="0"
                cellpadding="0"
                class="table"
                style="background-color: white;width: 100%;text-align: left;"
              >
                <thead>
                  <tr>
                    <th
                      rowspan="5"
                      colspan="3"
                      style="text-align: left;padding: 10px;vertical-align: top;height: 190px;font-weight: 400;"
                    >
                      <h3>Delegate:</h3>

                      <v-text-field
                        v-model="formB.employee.name"
                        readonly
                        label="Public Officer Name"
                        append-icon="mdi-lock"
                      ></v-text-field>

                      <v-text-field
                        readonly
                        v-model="formB.department_descr"
                        label="Department"
                        append-icon="mdi-lock"
                      ></v-text-field>

                      <v-text-field v-model="formB.program_branch" label="Program" @change="itemChanged"></v-text-field>

                      <v-text-field
                        v-model="formB.employee.title"
                        label="Position title"
                        @change="itemChanged"
                      ></v-text-field>
                    </th>
                    <th colspan="12">SPENDING AUTHORITY</th>
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
                    <th colspan="3" rowspan="2">OTHER:<br />S.24 COMMITMENT & <br />S.23 SIGNING CONTRACT</th>
                    <th rowspan="2">S.29</th>
                  </tr>
                  <tr>
                    <th colspan="4">S.24 Commitment</th>
                    <th colspan="2" style="max-width: 80px">
                      S.23 Signing Contract
                    </th>
                  </tr>
                  <tr>
                    <th colspan="2" style="max-width: 80px">
                      OWN PROCUREMENT
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Request for goods<br />or services</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Assignment <br />Authority</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div class="mb-2">Goods</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div class="mb-2">Services</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div class="mb-2">S.24 Commitment</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>S.23 Signing<br />contract</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>S.24 Travel <br />authorization</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Other contracts &<br />Expenditures **</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Loans & <br />Guarantees</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Certificate of <br />performance</div>
                    </th>
                    <th rowspan="4" class="rotate">
                      <div>Requesition<br />for payment</div>
                    </th>
                  </tr>
                  <tr>
                    <th class="rotate" rowspan="4">
                      <div class="mb-2">Goods</div>
                    </th>
                    <th class="rotate" rowspan="4">
                      <div class="mb-2">Services</div>
                    </th>
                  </tr>
                  <tr style="height: 30px">
                    <th style="height: 30px">
                      Area of Authority
                    </th>
                    <th style="height: 30px">
                      Operational Restrictions
                    </th>
                    <th style="height: 30px">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(line, idx) of formB.authority_lines" :key="idx">
                    <td class="">
                      <v-text-field
                        v-model="line.coding"
                        dense
                        filled
                        hide-details
                        prepend-inner-icon="mdi-delete"
                        @click:prepend-inner="removeLine(idx)"
                        @change="codingChanged(line)"
                      >
                        <template slot="append">
                          <v-icon color="success" title="Valid coding" v-if="!line.coding_invalid && !line.is_working"
                            >mdi-check</v-icon
                          >
                          <v-icon color="error" title="Invalid coding" v-if="line.coding_invalid && !line.is_working"
                            >mdi-alert</v-icon
                          >
                          <v-progress-circular
                            indeterminate
                            v-if="line.is_working"
                            color="primary"
                            size="20"
                            width="3"
                            style="margin-top: 2px"
                          ></v-progress-circular>
                        </template>
                      </v-text-field>
                    </td>
                    <td class="">
                      <v-select
                        class=""
                        :items="items"
                        @change="itemChanged"
                        dense
                        filled
                        hide-details
                        v-model="line.operational_restriction"
                      ></v-select>
                    </td>
                    <td>
                      <v-text-field v-model="line.notes" dense filled hide-details @change="itemChanged"></v-text-field>
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
              <v-btn color="primary" @click="addLine">Add line</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <v-dialog></v-dialog>
  </v-container>
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
import { mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "AuthorityDetails",
  components: {},
  data: () => ({
    page: {
      title: "",
    },
    id: "",

    authority: {},
    showUpload: false,
    items: [],
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),
    ...mapGetters("department", ["departments"]),
    breadcrumbs: function() {
      let b = [{ text: "Signing Authorities Home", to: "/dashboard" }];

        b.push({
          text: `${this.formB.department_descr}`,
          to: `/departments/${this.formB.department_code}`,
        });
        b.push({
          text: `Form B Authorizations`,
          to: `/departments/${this.formB.department_code}/form-b`,
        });
        b.push({
          text: `${this.formB.employee.title} (${this.formB.employee.name}) - Edit`,
        });
      return b;
    },

    canSave() {
      if (this.formB && this.formB.authority_lines) {
        for (let line of this.formB.authority_lines) {
          if (line.coding_invalid || line.is_working) return false;
        }

        return true;
      }
      return false;
    },
  },
  async mounted() {
    this.id = this.$route.params.id;
    let p = await this.loadFormB(this.id);

    this.page.title = `Form B for ${p.employee.name}`;
    this.items = Object.keys(await this.getOperationalRestictions());
  },
  methods: {
    ...mapActions("authority/formB", ["loadFormB", "saveFormB"]),
    ...mapActions("authority", ["getOperationalRestictions"]),
    ...mapMutations("authority/formB", ["setFormB"]),

    addLine() {
      this.formB.authority_lines.push({ coding: `${this.formB.department_code}` });
    },
    removeLine(idx) {
      this.formB.authority_lines.splice(idx, 1);
      this.saveFormB(this.formB);
    },
    itemChanged() {
      this.setFormB(this.formB);
    },
    codingChanged(line) {
      line.is_working = true;
      this.itemChanged();
    },
    saveClick() {
      this.saveFormB(this.formB);
      this.closeClick();
    },
    closeClick() {
      this.$router.push(`/form-b/${this.id}`);
    },
  },
};
</script>
