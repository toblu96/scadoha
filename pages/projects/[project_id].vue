<template>
  <div>
    <pre>{{ project }}</pre>
  </div>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {
  BarsArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/vue/20/solid";

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
