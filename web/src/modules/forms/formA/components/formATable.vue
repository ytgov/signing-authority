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
        <th colspan="2" rowspan="4"
          style="text-align: left; padding: 10px; vertical-align: middle">
            Department:<br />
              <strong>{{ formA.department.name }}</strong>
              <br /> <br /> <br />
              Program/Branch:<br />
              <strong>{{ formA.program }}</strong>
        </th>
        <th colspan="7">
          SPENDING AUTHORITY
        </th>
        <th rowspan="5" class="rotate" style="height: 140px">
          <div>
            PAYMENT<br />
            AUTHORITY s.30
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6">
          SECTION 23 and SECTION 24 ($000)
        </th>
        <th rowspan="4" class="rotate">
          <div>(SECTION 29) <br />
            CERTIFICATE OF <br />PERFORMANCE
          </div>
       </th>
      </tr>
      <tr>
        <!-- <th colspan="2" rowspan="2"  style="text-align: left; padding: 10px; vertical-align: middle">
          Program/Branch:<br />
              <strong>{{ formA.program }}</strong>B</th> -->
        <th rowspan="3" class="rotate">
          <div>
            CONTRACTS FOR <br />GOODS OR SERVICES
          </div>
        </th>
        <th rowspan="3" class="rotate">
          <div>LOANS & <br />GUARANTEES </div>
        </th>
        <th rowspan="3" class="rotate">
           <div class="mb-2">Transfer <br/> Payments</div>
        </th>
        <th rowspan="3" class="rotate">
          <div class="mb-2">AUTHORIZATION <br />FOR TRAVEL</div>
        </th>
        <th rowspan="3" class="rotate">
          <div class="mb-2">REQUEST FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="3" class="rotate">
           <div>ASSIGNMENT <br />AUTHORITY</div></th>
      </tr>
      <tr>
      </tr>
      <tr>
        <th class="bottom">
              <div>POSTION</div>
            </th>
            <th class="bottom">
              AREA OF <br />AUTHORITY
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
  height: 200px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
}
.table th.bottom {
  vertical-align: bottom;

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
