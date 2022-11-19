<template>
  <h1>Project {{ $route.params.projectid }}</h1>
  <NuxtLink to="/">Back</NuxtLink>

  <h2>Devices</h2>
  <input type="text" v-model="deviceName" />
  <button @click="createDevice">Add device</button>
  <ul>
    <li v-for="device in data?.devices">
      {{ device.id }} | {{ device.name }}
      <NuxtLink
        :to="`/projects/${$route.params.projectid}/devices/${device.id}`"
        >Show</NuxtLink
      >
      <button @click="deleteDevice(device.id)">Delete</button>
    </li>
  </ul>
</template>
<script setup lang="ts">
const deviceName = ref("");
const route = useRoute();
const { data, refresh } = await useFetch(`/api/devices`, {
  query: {
    project: route.params.projectid,
  },
  key: route.params.projectid as string,
});

async function createDevice() {
  const { data } = await useFetch("/api/devices/add", {
    method: "POST",
    body: {
      name: deviceName.value,
      projectId: route.params.projectid,
    },
    initialCache: false,
  });
  await refresh();
}
async function deleteDevice(id: string) {
  const { data } = await useFetch(`/api/devices/${id}`, {
    method: "DELETE",
    initialCache: false,
  });
  await refresh();
}
</script>
