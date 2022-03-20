<template>
  <div>
    <v-card class="default mb-4" :to="`/form-b/${authority._id}`">
      <v-card-text>
        <p>Department: {{ authority.department.name }}</p>
        <p>Program: {{ authority.program }}</p>
        <p>Title: {{ authority.title }}</p>
        <p>Issue date: {{ authority.issue_date }}</p>
        <p>Lines: {{ authority.authority_lines.length }}</p>

        <v-btn color="error" class="mr-5">Archive</v-btn>
        <v-btn color="info" class="mr-5">Make changes</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AuthorityRenderer",
  props: ["authority"],
};
</script>
