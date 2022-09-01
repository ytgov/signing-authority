<template>
    <tbody>
        <tr v-for="(line, idx) of formB.authority_lines" :key="idx">
            <td class="pl-3">{{ line.coding_display }}</td>
            <td class="pl-3" style="width: 200px">
                {{ line.operational_restriction }}
            </td>
            <td class="pl-3" style="">
                {{ line.notes }}
            </td>
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
            <td class="fb-value">{{ line.s29_performance_limit }}</td>
            <td class="fb-value">{{ line.s30_payment_limit }}</td>
        </tr>
    </tbody>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "tableBody",
    data: () => ({}),
    computed: {
        ...mapState("authority/formB", ["formB"]),
    },
    methods: {},
    async mounted() {},
};
</script>

<style>
.table .fb-value {
    width: 60px;
    text-align: center;
}
.table td {
    border: 1px black solid;
}
</style>