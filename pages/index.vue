<template>
  <div>Projects</div>
  <input type="text" v-model="projectName" />
  <button @click="createProject">Create Project</button>
  <ul>
    <li v-for="project in data?.projects">
      {{ project.id }} | {{ project.name }} | {{ project.description }}
      <NuxtLink :to="`/projects/${project.id}`">Show</NuxtLink>
      <button @click="deleteProject(project.id)">Delete</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
let projectName = ref("");

const { data, refresh } = await useFetch("/api/projects");

async function createProject() {
  const { data } = await useFetch("/api/projects/add", {
    method: "POST",
    body: {
      name: projectName.value,
    },
    initialCache: false,
  });
  console.log(data.value);
  await refresh();
}
async function deleteProject(id: string) {
  const { data } = await useFetch(`/api/projects/${id}`, {
    method: "DELETE",
    initialCache: false,
  });
  await refresh();
}
</script>
