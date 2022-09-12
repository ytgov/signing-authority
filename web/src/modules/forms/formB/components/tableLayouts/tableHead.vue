<template>
    <thead>
        <tr>
            <!-- 1 columm x 5 rows -->
            <delegate-info></delegate-info>

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
            <th colspan="3" rowspan="2">
                OTHER:<br />S.24 COMMITMENT & <br />S.23 SIGNING CONTRACT
            </th>
            <th rowspan="2">S.29</th>
        </tr>
        <tr>
            <th colspan="4">S.24 Commitment</th>
            <th colspan="2" style="max-width: 80px">S.23 Signing Contract</th>
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
        <tr style="height: 30px; text-align: left">
            <th style="text-align: left; padding-left: 10px">
                Area of Authority
            </th>
            <th style="text-align: left; padding-left: 10px">OPERATIONAL RESTRICTIONS</th>
            <th style="text-align: left; padding-left: 10px">NOTES</th>
        </tr>
    </thead>
</template>

<script>
import delegateInfo from "./delegateInfo.vue";
export default {
    name: "authorityLayout",
    components: {
        delegateInfo,
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
