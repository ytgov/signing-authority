<template>
  <tbody>
    <tr v-for="(line, idx) of formA.authority_lines" :key="idx">
      <td class="fb-value" v-bind:class="checkProblem(idx, ['has no value', 'No parent rows'])">
        <v-text-field
          v-model="line.coding"
          dense
          filled
          hide-details
          class="pl-2"
          prepend-icon="mdi-delete"
          @click:prepend="removeLine(idx)"
          @change="codingChanged(line)"
        >
          <template slot="append">
            <v-icon color="success" title="Valid coding" v-if="!line.coding_invalid && !line.is_working"
              >mdi-check</v-icon
            >
            <v-icon color="error" title="Invalid coding" v-if="line.coding_invalid && !line.is_working"
              >mdi-alert</v-icon
            >
            <v-progress-circular
              indeterminate
              v-if="line.is_working"
              color="primary"
              size="20"
              width="3"
              style="margin-top: 2px"
            ></v-progress-circular>
            <div style="display:none">{{ version }}</div>

            <v-menu bottom left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" class="my-0">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense>
                <v-list-item @click="moveLineUp(idx)" :disabled="idx == 0">
                  <v-list-item-icon><v-icon>mdi-arrow-up</v-icon></v-list-item-icon>
                  <v-list-item-title>Move up</v-list-item-title>
                </v-list-item>
                <v-list-item @click="moveLineDown(idx)" :disabled="idx == formA.authority_lines.length - 1">
                  <v-list-item-icon><v-icon>mdi-arrow-down</v-icon></v-list-item-icon>
                  <v-list-item-title>Move down</v-list-item-title>
                </v-list-item>
                <v-list-item @click="duplicateLine(idx)">
                  <v-list-item-icon><v-icon>mdi-content-copy</v-icon></v-list-item-icon>
                  <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-text-field>
      </td>
      <td class="">
        <v-select
          class=""
          :items="items"
          @change="itemChanged"
          dense
          filled
          hide-details
          v-model="line.operational_restriction"
        ></v-select>
      </td>
      <td class="fb-value" v-bind:class="checkProblem(idx, 'Contracts limit invalid')">
        <!-- Contracts for Goods or Services -->
        <v-text-field
          v-model="line.contracts_for_goods_services"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value" v-bind:class="checkProblem(idx, 'Loans limit invalid')">
        <!-- Loans and Guarantees -->
        <v-text-field
          v-model="line.loans_and_guarantees"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>

      <td class="fb-value" v-bind:class="checkProblem(idx, 'Transfer limit invalid')">
        <!-- Transfer Payments-->
        <v-text-field v-model="line.transfer_payments" dense filled hide-details @change="itemChanged"></v-text-field>
      </td>
      <td class="fb-value" v-bind:class="checkProblem(idx, 'Travel limit invalid')">
        <!--Authorization for Travel-->
        <v-text-field
          v-model="line.authorization_for_travel"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>

      <td class="fb-value" v-bind:class="checkProblem(idx, 'Request limit invalid')">
        <!-- Request for Goods or Services -->
        <v-text-field
          v-model="line.request_for_goods_services"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>

        {{ line.s23_procure_goods_limit }}
      </td>

      <td class="fb-value" v-bind:class="checkProblem(idx, 'Assignment limit invalid')">
        <!-- Assignment Authority -->
        <v-text-field
          v-model="line.assignment_authority"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value" v-bind:class="checkProblem(idx, 'Performance limit invalid')">
        <!-- Section 29 Certificate of Performance -->
        <v-text-field
          v-model="line.s29_performance_limit"
          dense
          filled
          hide-details
          @change="itemChanged"
        ></v-text-field>
      </td>
      <td class="fb-value" v-bind:class="checkProblem(idx, 'Payment limit invalid')">
        <!-- Section 30 Payment Authority -->
        <v-text-field v-model="line.s30_payment_limit" dense filled hide-details @change="itemChanged"></v-text-field>
      </td>
    </tr>
  </tbody>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";
import _ from "lodash";

export default {
  name: "formATable",
  props: {
    saveError: Object,
  },
  data: () => ({
    items: [],
  }),
  computed: {
    ...mapState("authority/formA", ["formA", "version"]),
  },
  methods: {
    ...mapActions("authority", ["getOperationalRestictions"]),
    ...mapMutations("authority/formA", ["setFormA"]),

    removeLine(idx) {
      this.formA.authority_lines.splice(idx, 1);
      this.setFormA(this.formA);
    },
    itemChanged() {
      this.setFormA(this.formA);
    },
    codingChanged(line) {
      line.is_working = true;
      this.itemChanged();
    },
    moveLineUp(idx) {
      let item = this.formA.authority_lines.splice(idx, 1)[0];
      this.formA.authority_lines.splice(idx - 1, 0, item);
    },
    moveLineDown(idx) {
      let item = this.formA.authority_lines.splice(idx, 1)[0];
      this.formA.authority_lines.splice(idx + 1, 0, item);
    },
    duplicateLine(idx) {
      let item = _.clone(this.formA.authority_lines[idx]);
      this.formA.authority_lines.splice(idx + 1, 0, item);
    },
    checkProblem(idx, fields) {
      if (this.saveError && this.saveError.error) {
        if (!_.isArray(fields)) fields = [fields];
        for (let field of fields)
          if (this.saveError.line == idx && this.saveError.error.indexOf(field) >= 0) return "problem";
      }
      return "";
    },
  },
  async mounted() {
    this.items = await this.getOperationalRestictions();
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
  height: 200px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
  max-width: 80px;
}
.table th.bottom {
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
.table .fb-value {
  width: 60px;
  text-align: center;
}
td.problem {
  background-color: #ff000055 !important;
}
</style>
