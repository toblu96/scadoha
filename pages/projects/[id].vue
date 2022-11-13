<template>
  <h1>{{ $route.params.id }}</h1>
  <NuxtLink to="/">Back</NuxtLink>

  <div>hello from project {{ $route.params.id }}</div>
  <h2>Devices</h2>
  <input type="text" v-model="deviceName" />
  <button @click="createDevice">Add device</button>
  <ul>
    <li v-for="device in data?.devices">
      {{ device.id }} | {{ device.name }}
      <button @click="deleteDevice(device.id)">Delete</button>
    </li>
  </ul>
</template>
<script setup lang="ts">
const deviceName = ref("");
const route = useRoute();
const { data, refresh } = await useFetch(`/api/devices`, {
  query: {
    project: route.params.id,
  },
  key: route.params.id as string,
});

async function createDevice() {
  const { data } = await useFetch("/api/devices/add", {
    method: "POST",
    body: {
      name: deviceName.value,
      projectId: route.params.id,
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
