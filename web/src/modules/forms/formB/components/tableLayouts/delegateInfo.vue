<template>
  <!-- TODO: Make these items editable - if allowed -->
  <th rowspan="5" colspan="3" style="text-align: left; padding: 10px; vertical-align: top;width: 60%;font-weight: 400;">
    Public Officer Name:<br />
    <strong>
      {{ formB.employee.name }}
    </strong>
    <br /><br />

    Department:<br />
    <strong>{{ formB.department_descr }}</strong><br />
    <v-btn v-if="formB.department_descr === 'TOURISM AND CULTURE' && canAdminister" color="error" small class="mb-0"
      @click="updateDepartmentName">Update Dept Name</v-btn>
    <br /><br />
    Program:<br />
    <strong>{{ formB.program_branch }}</strong>
    <br /><br />
    Activity:<br />
    <strong>{{ formB.activity || formB.form_a.activity }}</strong>
    <br /><br />
    Position title:<br />
    <strong>{{ formB.employee.title }}</strong>
  </th>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "delegateInfo",
  computed: {
    ...mapState("authority/formB", ["formB"]),
    ...mapState("home", ["profile"]),

    canAdminister() {
      if (this.profile && this.profile.roles && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Form B Administrator") &&
          this.profile.department_admin_for.includes(this.formB.department_code)
        )
          return true;
      }

      return false;
    },
  },
  methods: {
    ...mapActions("authority/formB", ["saveFormB", "loadFormB"]),

    async updateDepartmentName() {
      if (!confirm('This will update this Form B\'s Department from "TOURISM AND CULTURE" to "ECONOMIC DEVELOPMENT, TOURISM AND CULTURE". This action cannot be undone. Would you like to continue?')) return;
      this.formB.department_descr = "ECONOMIC DEVELOPMENT, TOURISM AND CULTURE";
      this.formB.save_action = "UpdateDepartmentName";
      await this.saveFormB(this.formB);
      await this.loadFormB(this.formB._id);
    },
  },
};
</script>
