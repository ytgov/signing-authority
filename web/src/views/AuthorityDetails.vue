
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-title> Future Home of Viewing a Signing Auth</v-card-title>
          <v-card-text> 
            <v-data-table
            :headers="[{text:'Account', value:'account'}, {text: 'S23 Goods', value:'s24_procure_goods_limit'}]"
            :items="formB.authority_lines"></v-data-table>


          </v-card-text>
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
import { mapGetters, mapActions} from "vuex";

export default {
  name: "AuthorityDetails",
  data: () => ({
    id: "",
    authority: {},
  }),
  computed: {
    ...mapGetters("authority", ["formB"]),
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
         text: `${this.formB.employee.first_name} ${this.formB.employee.last_name}`,
         to: `/employee/${this.formB.employee_id}`
      });
      b.push({ text: `Form B (${this.formB.department.name} - )` });
      return b;
    },
  },
  async mounted() {
    this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
  },
  methods: {
    ...mapActions("authority", ["loadFormB"]),
  }
};
</script>