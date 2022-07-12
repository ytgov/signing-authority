
<template>
  <v-container>
    <v-card class="mt-5 default">
      <v-card-title>Seed Data</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-btn
                @click="seedData()">
                  Seed Data
              </v-btn>
            </v-col>
            <v-spacer />
            <v-col>
              <v-btn>
                Remove Seed Data
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
      ])
    // seedData: function () {
    //   alert("This will remove ALL data in the system and restore it with default data")
    // }
  }

}
</script>

<style>

</style>