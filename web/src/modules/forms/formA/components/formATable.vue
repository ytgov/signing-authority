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
          colspan="2"
          rowspan="5"
          style="text-align: left; padding: 10px; vertical-align: middle"
        >


          Department:<br />
          <strong>{{ formA.department.name }}</strong>
          <br /><br />
          Program/Branch:<br />
          <strong>{{ formA.program }}</strong>

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
      <tr v-for="(line, idx) of formA.authority_lines" :key="idx">
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
</template>
<script>
export default {
  name: "formATable",
  props: {
    formA: Object
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
  height: 160px;
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
