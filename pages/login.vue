<template>
  <pre>Auth: {{ $pb.authStore.isValid }}</pre>
  <pre>{{ user }}</pre>
  <button @click="login">login</button>
  <button @click="logout">logout</button>
  <p>{{ error_message }}</p>
</template>

<script setup lang="ts">
const user = usePocketbaseUser();
const error_message = ref("");

const login = async () => {
  try {
    await useNuxtApp()
      .$pb.collection("users")
      .authWithPassword("admin", "admin1234");
    error_message.value = "";
  } catch (error) {
    error_message.value = error.message;
  }
};
const logout = async () => {
  try {
    await useNuxtApp().$pb.authStore.clear();
    error_message.value = "";
  } catch (error) {
    error_message.value = error.message;
  }
};
</script>
