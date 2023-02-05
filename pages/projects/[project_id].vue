<template>
  <div class="w-full space-y-24">
    <ProjectPageHeader v-if="project" :project="project" />
    <ProjectBrokerTable :brokers="project?.expand['mqtt_brokers(project)']" />
    <ProjectTagsTable :brokerTags="project?.expand['mqtt_brokers(project)']" />
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
      expand: "mqtt_brokers(project), mqtt_brokers(project).mqtt_tag(broker)",
    });

  return structuredClone(records);
});
</script>
