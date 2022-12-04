<template>
  <h1>Device {{ $route.params.deviceid }}</h1>
  <NuxtLink :to="`/projects/${$route.params.projectid}`">Back</NuxtLink>

  <h2>Tags</h2>
  <input type="text" v-model="tagName" />
  <button @click="createTag">Add tag</button>
  <ul>
    <li v-for="tag in data?.tags">
      {{ tag.id }} | {{ tag.name }}

      <button @click="deleteTag(tag.id)">Delete</button>
    </li>
  </ul>
</template>
<script setup lang="ts">
const tagName = ref("");
const route = useRoute();

const { data, refresh } = await useFetch(
  `/api/devices/${route.params.deviceid}/tags`,
  {
    query: {
      project: route.params.projectid,
    },
    key: route.params.projectid as string,
  }
);

async function createTag() {
  const { data } = await useFetch("/api/devices/:deviceid/tags/add", {
    method: "POST",
    body: {
      name: tagName.value,
      deviceId: route.params.deviceid,
    },
  });
  await refresh();
}
async function deleteTag(id: string) {
  const { data } = await useFetch(
    `/api/devices/${route.params.deviceid}/tags/${id}`,
    {
      method: "DELETE",
    }
  );
  await refresh();
}
</script>
