<template>
  <v-card>
  <!-- <v-toolbar color="#244C5A" dark>
    <v-toolbar-title>
      Supervisor: {{formB.supervisor_name}}, {{formB.supervisor_title}}
    </v-toolbar-title>
    <v-spacer></v-spacer>
     <v-icon @click="$emit('close')">mdi-close</v-icon>
  </v-toolbar> -->
    <v-card-text>
      <v-row>
        <v-col md="4">
          <v-text-field
            label = "Issue Date"
            v-model= "formB.issue_date"
            class="mt-2">{{formB.issue_date}}
          </v-text-field>
          <v-row>
            <v-col
              md="8">
              <v-text-field
                label = "Expiry Date"
                v-model= "formB.issue_date"
                class="mt-2">
                  {{formB.issue_date}}
              </v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col>
              <v-checkbox
                label="Activated by Memo"
                color="#F2A900"
                value="formB.activated_by_memo">
              </v-checkbox>
             </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-header>Cancelling Information</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-text-field
                        label = "Date Cancelled"
                        v-model= "formB.date_cancelled"
                        class="mt-2">
                          {{formB.date_cancelled}}
                      </v-text-field>
                      <v-select
                        label="Reason for Cancelling"
                        :items="cancelledReasons"
                        v-model="formB.reason_for_cancelling" >
                      </v-select>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-col>
        <v-spacer></v-spacer>
        <v-col
          md="4">
          <div
          class="mb-2">
            <span class="text-subtitle-1"> <span class="font-weight-black">Supervisor:</span> {{formB.supervisor_name}}, {{formB.supervisor_title}} </span>
          </div>
          <v-card>
           <v-toolbar dark color="#7A9A01"><v-toolbar-title>Review</v-toolbar-title></v-toolbar>
            <v-card-text>
              <v-checkbox
                class="my-0 py-0"
                label="Reviewed by Department"
                v-model="formB.reviewed_by_department">
              </v-checkbox>
              <v-checkbox
                class= "my-0 py-0"
                label="Signed by Supervisor"
                v-model= "formB.reviewed_by_supervisor">
              </v-checkbox>
              <v-checkbox
                class= "my-0 py-0"
                label="Signed by Employee"
                v-model="formB.employee_signed">
              </v-checkbox>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "authorityMetaDataCard",

  props: {
    formB: {
      type: Object,

    }
  },
  data: () => ({
    cancelledReasons: [
      "Some",
      "Reasons",
      "For",
      "Cancelling"
    ],
  }),
}
</script>

<style>

</style>