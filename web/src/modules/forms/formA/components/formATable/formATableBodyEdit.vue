<template>


    <tbody>
      <tr v-for="(line, idx) of formA.authority_lines" :key="idx">

        <td class="" style="width: 300px;">
          <!-- Position -->
          <v-text-field
            v-model="formA.position"
            dense
            filled
            hide-details
            @change="itemChanged"
            prepend-inner-icon="mdi-delete"
            @click:prepend-inner="removeLine(idx)"
          ></v-text-field>
        </td>
        <td class="fb-value" style="width: 200px;">
          <!-- Area of Authority -->
           <v-text-field
              v-model="line.account"
              dense
              filled
              hide-details
              @change="itemChanged"
            ></v-text-field>
        </td>
        <td class="pl-3" style="width: 200px;">
           <!-- Operational RESTRICTIONS -->
           <!-- {{ line.operational_restriction}} -->
           <v-select class="px-2 py-n5 "
          :items="items"
          @change="itemChanged"
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
           <v-text-field
            v-model="line.transfer_payments"
            dense
            filled
            hide-details
            @change="itemChanged"
          ></v-text-field>

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
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex"
export default {
  name: "formATable",
  // props: {
  //   formA: Object
  // },
  data: () => ({
    items: [

    ],
  }),
  computed: {
    ...mapState("authority/formA", ["formA"])
  },
  methods: {
    ...mapActions('authority', ["getOperationalRestictions"]),
    ...mapMutations("authority/formA", ["setFormA"]),

    removeLine(idx) {
      this.formA.authority_lines.splice(idx, 1);
      this.setFormA(this.formA);
    },
    itemChanged() {
      this.setFormA(this.formA);
    },

  },
  async mounted () {
    this.items = Object.keys(await this.getOperationalRestictions())
  }
}
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
