<template>
  <div>
    <v-card class="default mb-4">
      <v-card-title style="width: 100%">
        {{authority.department_descr}}: {{ authority.program_branch }}

      </v-card-title>

      <v-card-text>
        <table class="mb-5">
          <tr>
            <td style="width: 120px">Position Title:</td>
            <td>
              <strong>{{ authority.employee.title }}</strong>
            </td>
          </tr>
          <tr>
            <td>Issue date:</td>
            <td>
              <strong>{{ authority.issue_date_display }}</strong>
            </td>
          </tr>
        </table>

        <v-row>
          <v-col cols="6" class="d-flex mb-0 pb-0">
            <v-btn
              color="secondary"
              class="mb-0"
              :to="`/form-b/${authority._id}`"
            >
              View details
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col style="text-align: right" class="mb-0 pb-0">
            <pdf-preview-button
              :pdfURL="pdfURL"
              class="mb-0"
            ></pdf-preview-button>
          </v-col>
          <v-col cols="12">
            <v-chip color="success">Active - Expires in 2 weeks</v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import pdfPreviewButton from "./PDFPreviewButton.vue";
export default {
  components: { pdfPreviewButton },
  name: "AuthorityRenderer",
  props: ["authority"],
  data: () => ({}),
  computed: {
    pdfURL: function () {
      return `${AUTHORITY_URL}/${this.authority._id}/pdf`;
    },
  },
};
</script>
