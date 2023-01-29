<template>
  <div class="w-full space-y-24">
    <ProjectPageHeader v-if="project" :project="project" />
    <ProjectBrokerTable
      v-if="project?.expand.broker.length > 0"
      :brokers="project?.expand.broker"
    />
    <ProjectTagsTable
      v-if="project?.expand.broker.length > 0"
      :brokerTags="project?.expand.broker"
    />
    <p>{{ project?.expand.broker }}</p>
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
  expand: any;
}
const route = useRoute();

const { data: project } = await useAsyncData(async (nuxtApp) => {
  const records = await nuxtApp?.$pb
    .collection("projects")
    .getOne<IProject>(route.params.project_id as string, {
      expand: "broker, broker.tags, members",
    });

  return structuredClone(records);
});
</script>
