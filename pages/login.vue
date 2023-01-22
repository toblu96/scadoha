<template>
  <pre>Auth: {{ $pb.authStore.isValid }}</pre>
  <pre>{{ user }}</pre>
  <button @click="login">login</button>
  <button @click="logout">logout</button>
</template>

<script setup lang="ts">
const user = usePocketbaseUser();

const login = async () => {
  useNuxtApp().$pb.collection("users").authWithPassword("admin", "admin1234");
};
const logout = async () => {
  useNuxtApp().$pb.authStore.clear();
};
</script>
