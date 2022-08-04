<template>
    <thead>
        <tr>
            <th
                colspan="2"
                rowspan="4"
                style="
                    text-align: left;
                    padding: 10px;
                    vertical-align: top;
                    font-weight: 400;
                "
            >
                <v-text-field
                    label="Department"
                    readonly
                    v-model="formA.department_descr"
                    append-icon="mdi-lock"
                ></v-text-field>
                <v-text-field
                    label="Program / Branch"
                    v-model="formA.program_branch"
                    @change="itemChanged"
                ></v-text-field>
                <v-text-field
                    label="Position"
                    v-model="formA.position"
                    hide-details
                    @change="itemChanged"
                ></v-text-field>
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
            <th colspan="6" style="height: 80px">
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
            <th class="bottom">AREA OF <br />AUTHORITY</th>
            <th class="bottom">OPERATIONAL <br />RESTRICTIONS</th>
        </tr>
    </thead>
</template>
<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: "formATableHead",
    // props: {
    //   formA: Object
    // },
    data: () => ({}),
    computed: {
        ...mapState("authority/formA", ["formA"]),
    },
    methods: {
        ...mapMutations("authority/formA", ["setFormA"]),
        itemChanged() {
            this.setFormA(this.formA);
        },
    },
};
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
