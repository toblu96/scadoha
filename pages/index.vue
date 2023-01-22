<template>
  <pre>Auth: {{ $pb.authStore.isValid }}</pre>
  <button @click="logout">logout</button>
  <pre>User: {{ user }}</pre>
  <pre>Brokers: {{ broker }}</pre>
</template>

<script setup lang="ts">
interface IBroker {
  id: string;
  name: string;
}

const user = usePocketbaseUser();

const { data: broker } = await useAsyncData(async (nuxtApp) => {
  const records = await nuxtApp?.$pb
    .collection("mqtt_brokers")
    .getFullList<IBroker>(undefined, {
      //   expand: "project",
    });

  return structuredClone(records);
});

const logout = async () => {
  console.log("logout triggered");
  useNuxtApp().$pb.authStore.clear();
};
</script>
