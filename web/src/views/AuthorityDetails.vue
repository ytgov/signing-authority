
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    {{ id }}
    <v-row>
      <v-col>
        <v-card>
          <v-card-title> Future Home of Viewing a Signing Auth</v-card-title>
          <v-card-text> Things happen here...</v-card-text>
          <v-card-actions>
            <v-btn color="primary" class="mx-5">
              Create New Signing Auths</v-btn
            >
            <v-btn color="primary" class="mx-5"> Create PDF </v-btn>
            <v-spacer />
            <v-btn color="secondary" class="mx-5"> Upload PDF </v-btn>
            <v-btn color="secondary" class="mx-5"> View PDF </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  name: "AuthorityDetails",
  data: () => ({
    id: "",
    authority: {},
  }),
  computed: {
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        // text: `${this.employee.first_name} ${this.employee.last_name}`,
      });
      b.push({ text: "Form B Authority" });
      return b;
    },
  },
  async mounted() {
    //this.loadEmployee(this.$route.params.id);
    this.id = this.$route.params.id;
  },
};
</script>