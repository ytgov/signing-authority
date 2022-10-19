<template>
  <tbody>
    <tr v-for="(line, idx) of formA.authority_lines" :key="idx">
      <td class="fb-value">
        <v-text-field
          v-model="line.coding"
          dense
          filled
          hide-details
          class="pl-2"
          prepend-icon="mdi-delete"
          @click:prepend="removeLine(idx)"
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
            <div style="display:none">{{version}}</div>
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
      <td class="fb-value">
        <!-- Contracts for Goods or Services -->
        <v-text-field
          v-model="line.contracts_for_goods_services"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value">
        <!-- Loans and Guarantees -->
        <v-text-field
          v-model="line.loans_and_guarantees"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>

      <td class="fb-value">
        <!-- Transfer Payments-->
        <v-text-field v-model="line.transfer_payments" dense filled hide-details @change="itemChanged"></v-text-field>
      </td>
      <td class="fb-value">
        <!--Authorization for Travel-->
        <v-text-field
          v-model="line.authorization_for_travel"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>

      <td class="fb-value">
        <!-- Request for Goods or Services -->
        <v-text-field
          v-model="line.request_for_goods_services"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>

        {{ line.s23_procure_goods_limit }}
      </td>

      <td class="fb-value">
        <!-- Assignment Authority -->
        <v-text-field
          v-model="line.assignment_authority"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value">
        <!-- Section 29 Certificate of Performance -->
        <v-text-field
          v-model="line.s29_performance_limit"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value">
        <!-- Section 30 Payment Authority -->
        <v-text-field v-model="line.s30_payment_limit" dense filled hide-details @change="itemChanged"></v-text-field>
      </td>
    </tr>
  </tbody>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";

export default {
  name: "formATable",
  // props: {
  //   formA: Object
  // },
  data: () => ({
    items: [],
  }),
  computed: {
    ...mapState("authority/formA", ["formA", "version"]),
  },
  methods: {
    ...mapActions("authority", ["getOperationalRestictions"]),
    ...mapMutations("authority/formA", ["setFormA"]),

    removeLine(idx) {
      this.formA.authority_lines.splice(idx, 1);
      this.setFormA(this.formA);
    },
    itemChanged() {
      this.setFormA(this.formA);
    },
    codingChanged(line) {
      line.is_working = true;
      this.itemChanged();
    },
  },
  async mounted() {
    this.items = Object.keys(await this.getOperationalRestictions());
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
``
