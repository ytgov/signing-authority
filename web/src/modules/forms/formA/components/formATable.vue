<template>
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
          colspan="3"
          rowspan="4"
          style="text-align: left; padding: 10px; vertical-align: middle"
        >
          Department:<br />
          <strong>{{ formA.department_descr }}</strong>
          <br />
          <br />
          <br />
          Program/Branch:<br />
          <strong>{{ formA.program_branch }}</strong>
          <br />
        </th>
        <th colspan="7" style="height: 40px">SPENDING AUTHORITY</th>
        <th rowspan="5" class="rotate" style="height: 140px">
          <div class="mb-2">
            PAYMENT<br />
            AUTHORITY s.30
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6" style="height: 40px">
          SECTION 23 and SECTION 24 ($000)
        </th>
        <th rowspan="4" class="rotate">
          <div class="ml-2">
            (SECTION 29) <br />
            CERTIFICATE OF <br />PERFORMANCE
          </div>
        </th>
      </tr>
      <tr>
        <!-- <th colspan="2" rowspan="2"  style="text-align: left; padding: 10px; vertical-align: middle">
          Program/Branch:<br />
              <strong>{{ formA.program }}</strong>B</th> -->
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">CONTRACTS FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">LOANS & <br />GUARANTEES</div>
        </th>
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">
            Transfer <br />
            Payments
          </div>
        </th>
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">AUTHORIZATION <br />FOR TRAVEL</div>
        </th>
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">REQUEST FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="3" class="rotate" style="">
          <div class="mb-2">ASSIGNMENT <br />AUTHORITY</div>
        </th>
      </tr>
      <tr></tr>
      <tr>
        <th class="bottom" style="">
          <div>POSITION</div>
        </th>
        <th class="bottom">AREA OF <br />AUTHORITY</th>
        <th class="bottom">OPERATIONAL <br />RESTRICTIONS</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(line, idx) of formA.authority_lines" :key="idx">
        <td class="px-3">
          <!-- Position -->
          {{ formA.position }}
        </td>
        <td class="pl-3">
          <!-- Area of Authority -->
          {{ line.account }}
        </td>
        <td class="pl-3">
          <!-- Operational RESTRICTIONS -->
          {{ line.operational_restriction }}
          <!-- <v-select class="px-2 py-n5 "
          :items="items"
          label="Operational Restrictions"
        ></v-select> -->
        </td>
        <td class="fb-value">
          <!-- Contracts for Goods or Services -->
          {{ line.contracts_for_goods_services }}
        </td>
        <td class="fb-value">
          <!-- Loans and Guarantees -->
          {{ line.loans_and_guarantees }}
        </td>

        <td class="fb-value">
          <!-- Transfer Payments-->
          {{ line.transfer_payments }}
        </td>
        <td class="fb-value">
          <!--Authorization for Travel-->
          {{ line.authorization_for_travel }}
        </td>

        <td class="fb-value">
          <!-- Request for Goods or Services -->
          {{ line.request_for_goods_services }}
        </td>

        <td class="fb-value">
          <!-- Assignment Authority -->
          {{ line.assignment_authority }}
        </td>
        <td class="fb-value">
          <!-- Section 29 Certificate of Performance -->
          {{ line.s29_performance_limit }}
        </td>
        <td class="fb-value">
          <!-- Section 30 Payment Authority -->
          {{ line.s30_payment_limit }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>
// import { mapState} from "vuex";
export default {
  name: "formATable",
  props: {
    formA: Object,
  },
  data: () => ({
    items: ["None", "Journal only", "Acquisition card", "Bank deposits"],
  }),
  // computed: {
  //   ...mapState("authority/formA", ["formA"])
  // }
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
