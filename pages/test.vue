<template>
  <pre>Auth: {{ $pb.authStore.isValid }}</pre>
  <button @click="logout">logout</button>
</template>

<script setup lang="ts">
const logout = async () => {
  console.log("logout triggered");
  useNuxtApp().$pb.authStore.clear();
};
</script>
