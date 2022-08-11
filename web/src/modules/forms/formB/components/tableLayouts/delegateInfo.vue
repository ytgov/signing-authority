<template>
    <!-- TODO: Make these items editable - if allowed -->
    <th
        rowspan="5"
        colspan="2"
        style="text-align: left; padding: 10px; vertical-align: top"
    >
        <h3>Delegate:</h3>
        Public Officer Name:<br />
        <strong>
            {{ formB.employee.name }}
        </strong>
        <br /><br />

        Department:<br />
        <strong>{{ formB.department_descr }}</strong>
        <br /><br />
        Program/Branch:<br />
        <strong>{{ formB.program_branch }}</strong>
        <br /><br />
        Position title:<br />
        <strong>{{ formB.employee.title }}</strong>
    </th>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "delegateInfo",
    computed: {
        ...mapState("authority/formB", ["formB"]),
    },
};
</script>
