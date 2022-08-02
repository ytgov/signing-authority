<template>
  <lock-form-b>
    <template v-slot:content>
      <v-chip dark class="mr-4 mb-1" color="yg_moss">
        <v-icon small>mdi-lock-open</v-icon>
      </v-chip>
    </template>
  </lock-form-b>
</template>

<script>
import lockFormB from "../../actions/lockFormB.vue";
export default {
name:"formBStatusLocked",
components:{
  lockFormB
},
//  data: () => ({
//     dialog: false,
//   }),
}
</script>
