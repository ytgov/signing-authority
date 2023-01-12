<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template slot="left">
        <div class="display: inline-block">
          Employee details for {{ employee.name }}<br />

          <span style="font-size: 90%; color: rgba(0,0,0,.6)">
            YNET Id: <strong>{{ employee.ynet_id }}</strong> &nbsp; &nbsp; Email:
            <a :href="`mailto:${employee.email}`"
              ><strong>{{ employee.email }}</strong></a
            ></span
          >
        </div>
      </template>

      <h3>Authority Summary</h3>
      <v-row>
        <v-col cols="12" sm="12" md="6" v-for="(item, idx) in employee.authorities" :key="idx">
          <AuthorityRenderer :authority="item"></AuthorityRenderer>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import AuthorityRenderer from "@/modules/forms/components/AuthorityRenderer.vue";

export default {
  components: { AuthorityRenderer },
  computed: {
    ...mapState("department", ["departments"]),
    ...mapGetters("employee", ["employee"]),
    breadcrumbs: function() {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.employee.name}`,
      });
      return b;
    },
    employee_department_name: function() {
      return this.departments.find((d) => d.dept === this.employee.primary_department);
    },
  },
  watch: {},
  data: () => ({
    page: { title: "Employee" },
  }),
  async mounted() {
    this.loadEmployee(this.$route.params.id);
  },
  methods: {
    ...mapActions("employee", ["loadEmployee"]),

    cleanType(value) {
      if (value == "substantive") return "Substantive Position";
      else if (value == "temporary") return "Temporary";
      if (value == "acting") return "Acting Assignment";
    },
  },
};
</script>
