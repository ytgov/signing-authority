<template>
  <v-dialog v-model="dialog" persistent>
    <v-overlay absolute :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular></v-overlay>
    <v-app-bar dark color="#0097A9">
      <v-toolbar-title>
        <v-btn icon @click="showPrev"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-btn icon class="mr-4" @click="showNext"><v-icon>mdi-chevron-right</v-icon></v-btn>
        <strong>{{ index + 1 }} of {{ activeIds.length }}</strong> - {{ title }}
      </v-toolbar-title>
      <v-spacer />
      <!-- <v-icon title="Print" @click="download" class="mr-5">mdi-printer</v-icon> -->
      <v-icon title="Close" @click="hide">mdi-close</v-icon>
    </v-app-bar>
    <v-card tile :height="previewHeight" style="overflow: scroll">
      <v-card-text>
        <pdf v-for="i in numPages" :src="loadingTask" :key="i" :page="i" @loaded="doneLoading"></pdf>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import pdf from "vue-pdf";
import { mapState } from "vuex";

export default {
  components: { pdf },
  data: () => ({
    dialog: false,
    pdfUrl: "",
    title: "",
    loading: false,
    previewHeight: "200px",

    loadingTask: undefined,
    numPages: undefined,

    index: 0,
    totalCount: 0,
    activeIds: []


  }),
  computed: {
    ...mapState("home", ["profile"]),
  },

  methods: {
    show(title, previewIds) {
      this.activeIds = previewIds;
      if (previewIds.length == 0) return

      if (previewIds.length > 0)
        this.showItem(0);

      this.title = title;
      this.dialog = true;

      let windowHeight = window.innerHeight;

      if (windowHeight < 400) this.previewHeight = "";
      else this.previewHeight = `${windowHeight - 200}px`;
    },
    hide() {
      this.title = "";
      this.pdfUrl = "";
      this.dialog = false;
      this.loading = false;
    },
    doneLoading() {
      this.loading = false;
    },
    download() {
      window.open(`${this.pdfUrl}`);
    },
    makeItemUrl(id) {
      return `${AUTHORITY_URL}/${id}/pdf`
    },
    showPrev() {
      if (this.index > 0) this.index--;
      else this.index = this.activeIds.length - 1;
      this.showItem(this.index);
    },
    showNext() {
      if (this.index < this.activeIds.length - 1) this.index++;
      else this.index = 0;
      this.showItem(this.index);
    },

    showItem(index) {
      const id = this.activeIds[index];
      this.loading = true;
      this.pdfUrl = this.makeItemUrl(id);

      this.loadingTask = pdf.createLoadingTask(this.pdfUrl);

      this.loadingTask.promise.then((pdf) => {
        this.numPages = pdf.numPages;
      });
    }
  },
};
</script>
