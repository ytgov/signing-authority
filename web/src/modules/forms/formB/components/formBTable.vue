<template>
  <table
    border="0"
    cellspacing="0"
    cellpadding="0"
    class="table"
    style="background-color: white; width: 100%; text-align: left"
  >
    <table-head></table-head>
    <table-body></table-body>
  </table>

</template>

<script>
import tableHead from "./tableLayouts/tableHead.vue"
import tableBody from "./tableLayouts/tableBody.vue"
export default {
  name: "FormBTable",
  components: {
    tableHead,
    tableBody
  }
}
</script>

<style>
.table {
  border-collapse: collapse;
}
</style>