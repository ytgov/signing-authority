
<template>
  <v-container>
    <v-card class="mt-5 default">
      <v-card-title>Data Management</v-card-title>
        <v-card-text>
          <notifications ref="notifier"></notifications>
          <v-row>
            <v-col>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn @click="doIt()" dark color="yg_twilight" v-on="on">
                    <v-icon>mdi-database</v-icon>
                    Seed Data
                  </v-btn>
                </template>
                <span>Delete everything in the database and start fresh with seed data</span>
              <!-- <v-btn
                @click="doIt()">
                  Seed Data
              </v-btn> -->
              </v-tooltip>
            </v-col>
            <v-spacer />
            <v-col>
              <v-btn
                @click="doNothing()">
                Remove Seed Data
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                @click="doNothing()">
                Archive Data
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {mapActions} from "vuex"
export default {
  name: "seedData",
  methods: {
     ...mapActions("administration", [
      "seedData",
      ]),
      doIt: async function() {
        let m = await this.seedData()
        this.$refs.notifier.show("success", "mdi-check", m)
      },
      doNothing: function() {
        this.$refs.notifier.show("error", "mdi-close", "Not implemented yet")
      }
  }

}
</script>

<style>

</style>