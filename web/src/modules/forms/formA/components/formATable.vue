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
          :colspan="branchColSpan"
          rowspan="3"
          style="
                        text-align: left;
                        padding: 10px;
                        vertical-align: top;
                        font-weight: 400;
                    "
        >
          <div v-if="branchBundle" style="margin-bottom: 10px">
            Department:<br />
            <strong>Department Holder {{branchBundle.data}} </strong>
          </div>
          <div v-else style="margin-bottom: 10px">
            Department:<br />
            <strong>{{ formA.department_descr }}</strong>
          </div>
          <div v-if="branchBundle" style="margin-bottom: 10px">
            Program/Branch:<br />
            <strong>Branch Holder</strong>
          </div>

          <div v-if="branchBundle" style="">
            Position:<br />
            <strong>All Positions</strong>
          </div>
          <div v-else style="">
            Position:<br />
            <strong>{{ formA.position }}</strong>
          </div>
        </th>
        <th colspan="7" style="height: 40px">SPENDING AUTHORITY</th>
        <th rowspan="4" class="rotate" style="height: 140px">
          <div class="mb-2">
            PAYMENT<br />
            AUTHORITY s.30
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6" style="height: 20px">
          SECTION 23 and SECTION 24 ($000)
        </th>
        <th rowspan="3" class="rotate">
          <div class="ml-2">
            (SECTION 29) <br />
            CERTIFICATE OF <br />PERFORMANCE
          </div>
        </th>
      </tr>
      <tr>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">CONTRACTS FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">LOANS & <br />GUARANTEES</div>
        </th>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">
            Transfer <br />
            Payments
          </div>
        </th>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">AUTHORIZATION <br />FOR TRAVEL</div>
        </th>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">REQUEST FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="2" class="rotate" style="">
          <div class="mb-2">ASSIGNMENT <br />AUTHORITY</div>
        </th>
      </tr>
      <tr v-if="!branchBundle">
        <th class="bottom" style="height: 34px; vertical-align: middle">
          AREA OF AUTHORITY
        </th>
        <th class="bottom" style="height: 34px; vertical-align: middle">
          OPERATIONAL RESTRICTIONS
        </th>
      </tr>
      <tr v-else>
        <th class="bottom" style="height: 34px; vertical-align: middle">
          POSITION
        </th>
        <th class="bottom" style="height: 34px; vertical-align: middle">
          AREA OF AUTHORITY
        </th>
        <th class="bottom" style="height: 34px; vertical-align: middle">
          OPERATIONAL RESTRICTIONS
        </th>
      </tr>
    </thead>
 <tbody v-if="branchBundle">

      <tr  v-for="(line, idx) of branchBundle" :key="idx">
        <td
          v-if="line.position">
          {{line.position}}
        </td>
        <td v-else>
        </td>
           <td class="pl-3">
          <!-- Area of Authority -->
          {{ line.coding }}
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

    <tbody v-if="!branchBundle">

      <tr  v-for="(line, idx) of formA.authority_lines" :key="idx">
        <td class="pl-3" v-if="branchBundle">
          <!-- Area of Authority -->
          <span v-if="!idx">
            {{ formA.position }}
          </span>
        </td>

        <td class="pl-3">
          <!-- Area of Authority -->
          {{ line.coding_display }}
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
    formA: {
      type: Object,
      required: false
    },
    branchBundle: {
      type: Array,
      required: false,
      default: null
    }
  },
  data: () => ({
    items: ["None", "Journal only", "Acquisition card", "Bank deposits"],
    holder: null
  }),
  methods: {
  positionRowSpan: function(item) {
    //return the count of postions in branch bundle
    return this.branchBundle.filter(position => position.position == item).length;
    }
  },
  computed: {
    branchColSpan: function() {
      if (this.branchBundle) {
        return 3;
      } else {
        return 2;
      }
    }
  },
  async mounted() {
    if (this.branchBundle) {
      null
    }
  }
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
