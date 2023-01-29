<template>
  <div class="w-full">
    <ProjectPageHeader v-if="project" :project="project" />
    <p>{{ project }}</p>
  </div>
</template>
<script setup lang="ts">
interface IProject {
  id: string;
  name: string;
  members: string[];
  description: string;
  broker: string[];
  created: Date;
  updated: Date;
}
const route = useRoute();

const { data: project } = await useAsyncData(async (nuxtApp) => {
  const records = await nuxtApp?.$pb
    .collection("projects")
    .getOne<IProject>(route.params.project_id as string, {
      expand: "broker, members",
    });

  return structuredClone(records);
});
</script>
