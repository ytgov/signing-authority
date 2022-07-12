<template>
    <thead>
      <tr>
        <th colspan="3" rowspan="4"
          style="text-align: left; padding: 10px; vertical-align: middle">
            Department:<br />
              <strong>{{ formA.department_descr }}</strong>
              <div v-if="formA.reviewed_by_department">
              <br /> <br /> <br />
              Program/Branch:<br />
              <strong>{{ formA.program_branch }}</strong>
              <br/>
              </div>
               <div v-else>
              <br /> <br /> <br />
              Program/Branch:
                <div style=" width: 300px;">
                <form-a-table-branch-edit></form-a-table-branch-edit>
             </div>

              </div>
        </th>
        <th colspan="7" style="height: 80px">
          SPENDING AUTHORITY
        </th>
        <th rowspan="5" class="rotate" style="height: 140px">
          <div class="mb-2">
            PAYMENT<br />
            AUTHORITY s.30
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6" style="height: 80px">
          SECTION 23 and SECTION 24 ($000)
        </th>
        <th rowspan="4" class="rotate">
          <div class="ml-2">(SECTION 29) <br />
            CERTIFICATE OF <br />PERFORMANCE
          </div>
       </th>
      </tr>
      <tr>
        <!-- <th colspan="2" rowspan="2"  style="text-align: left; padding: 10px; vertical-align: middle">
          Program/Branch:<br />
              <strong>{{ formA.program }}</strong>B</th> -->
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">
            CONTRACTS FOR <br />GOODS OR SERVICES
          </div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">LOANS & <br />GUARANTEES </div>
        </th>
        <th rowspan="3" class="rotate" style= "">
           <div class="mb-2">Transfer <br/> Payments</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">AUTHORIZATION <br />FOR TRAVEL</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
          <div class="mb-2">REQUEST FOR <br />GOODS OR SERVICES</div>
        </th>
        <th rowspan="3" class="rotate" style= "">
           <div class="mb-2">ASSIGNMENT <br />AUTHORITY</div></th>
      </tr>
      <tr>
      </tr>
      <tr>
        <th class="bottom" style= " ">
              <div>POSITION</div>
            </th>
            <th class="bottom">
              AREA OF <br />AUTHORITY
            </th>
             <th class="bottom">
              OPERATIONAL <br />RESTRICTIONS
            </th>
      </tr>

    </thead>


</template>
<script>
import formATableBranchEdit from './formATableBranchEdit.vue'
import { mapState} from "vuex";
export default {
  components: { formATableBranchEdit },
  name: "formATableHead",
  // props: {
  //   formA: Object
  // },
  data: () => ({
  }),
  computed: {
    ...mapState("authority/formA", ["formA"])
  }
}
</script>
<style scoped>
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

</style>
