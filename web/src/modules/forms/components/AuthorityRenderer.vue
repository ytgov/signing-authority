<template>
  <div>
    <v-card class="default mb-4">
      <v-card-title class="mb-3">
        <router-link :to="`/form-b/${authority._id}`">{{ authority.employee.title }}</router-link>

        <v-spacer />
        <v-chip dark color="blue">{{ authorityString }}</v-chip>

        <v-chip v-if="isLocked" dark class="ml-4" color="yg_lichen">
          <v-icon small>mdi-lock</v-icon>
        </v-chip>

        <v-chip v-else dark class="ml-4" color="yg_moss">
          <v-icon small>mdi-lock-open</v-icon>
        </v-chip>
      </v-card-title>

      <v-card-subtitle>
        <strong>{{ authority.department_descr }}</strong
        ><br />
        Program:
        <strong
          >{{ authority.program_branch }}
          <span v-if="authority.activity"> - {{ authority.activity }}</span>
        </strong>
      </v-card-subtitle>
      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="6" style="vertical-align: bottom">
            <div v-if="isActive">
              <v-chip v-if="isActive" dark class="" color="success"
                >Active<span class="ml-1" v-if="authority.authority_type != 'substantive' && expiresIn">{{
                  expiresIn
                }}</span>
              </v-chip>
            </div>
            <v-chip v-else-if="isCancelled" class="" dark color="purple">Cancelled</v-chip>
            <v-chip v-else-if="isScheduled" class="" dark color="yg_lichen"
              >Inactive
              <span class="ml-1"> - {{ scheduledIn }}</span>
            </v-chip>
            <v-chip v-else class="" dark color="yg_lichen">{{ authority.status }}</v-chip>
          </v-col>

          <v-spacer />

          <v-col style="min-width: 220px">
            <v-btn small color="secondary" class="my-0 mr-5" @click.stop="showFormAPdf">Form A</v-btn>
            <v-btn small color="secondary" class="my-0" @click.stop="showFormBPdf">Form B</v-btn></v-col
          >
        </v-row>
      </v-card-text>
    </v-card>
    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </div>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";
import moment from "moment";

export default {
  components: { PdfPreviewDialog },
  name: "AuthorityRenderer",
  props: ["authority"],
  data: () => ({}),
  computed: {
    isActive() {
      return this.authority.status == "Active";
    },
    isCancelled() {
      return this.authority.cancel_date ? true : false;
    },
    isLocked() {
      return this.authority.department_reviews && this.authority.department_reviews.length > 0;
    },
    isScheduled() {
      if (this.isActive || this.isCancelled) return false;
      if (!this.authority.activation || this.authority.activation.length == 0) return false;

      let scheds = this.authority.activation.filter((a) => a.current_status == "Scheduled");
      return scheds.length > 0;
    },

    authorityString() {
      if (this.authority.authority_type == "temporary") return "Temporary";
      if (this.authority.authority_type == "acting") return "Acting";
      return "Substantive";
    },
    expiresIn() {
      let hasExpire = false;
      let longest = moment().startOf("day");
      let actives = this.authority.activation.filter((a) => a.current_status == "Active");

      for (let active of actives) {
        if (active.expire_date) {
          hasExpire = true;
          let expire = moment(active.expire_date).startOf("day");
          if (longest.isBefore(expire)) longest = expire;
        }
      }

      if (hasExpire) return `- Expires ${longest.from(moment().startOf("day"))}`;
      return "";
    },
    scheduledIn() {
      if (!this.isScheduled) return "";

      let closest = moment()
        .add(5, "years")
        .startOf("day");
      let scheds = this.authority.activation.filter((a) => a.current_status == "Scheduled");

      for (let sched of scheds) {
        let start = moment(sched.date).startOf("day");
        if (closest.isAfter(start)) closest = start;
      }

      return `Scheduled ${closest.from(moment().startOf("day"))}`;
    },
  },
  methods: {
    showFormAPdf() {
      if (this.authority.form_a && this.authority.form_a.activation)
        this.$refs.pdfPreview.show(
          "Signed Form A",
          `${AUTHORITY_URL}/uploads/${this.authority.form_a.activation.file_id}/file`
        );
      else console.log("No form attached");
    },
    showFormBPdf() {
      if (this.authority.upload_signatures) {
        this.$refs.pdfPreview.show(
          "Signed Form B",
          `${AUTHORITY_URL}/uploads/${this.authority.upload_signatures.file_id}/file`
        );
      } else {
        this.$refs.pdfPreview.show("Form B Preview", `${AUTHORITY_URL}/${this.authority._id}/pdf`);
      }
    },
    openFormB() {
      this.$router.push(`/form-b/${this.authority._id}`);
    },
  },
};
</script>
