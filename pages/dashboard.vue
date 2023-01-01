<template>
  <div>Hello from dashboard. You are successfully logged in.</div>
  <button @click="client.auth.signOut()">Logout</button>
  <br />
  <div v-if="user">
    {{ user }}
  </div>

  <div>
    <h2>Projects</h2>
    {{ projects }}
    <ul>
      <li v-for="project in projects" :key="project.id">
        {{ project.name }} | {{ project.description }}
      </li>
    </ul>
    {{ err }}
  </div>

  <div>
    <h2>Related devices</h2>
    {{ devices }}
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }} | {{ device.description }}
      </li>
    </ul>
    {{ err }}
  </div>
</template>

<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";
import { PostgrestError } from "@supabase/postgrest-js";

definePageMeta({
  middleware: "auth",
});

const err = ref<PostgrestError | null>(null);

const user = useSupabaseUser();
const client = useSupabaseAuthClient();
let realtimeChannel: RealtimeChannel;

const { data: projects } = await useAsyncData("projects", async () => {
  const { data, error } = await client
    .from("project")
    .select("id,name,description");
  err.value = error;
  return data;
});
const { data: devices, refresh: refreshDevices } = await useAsyncData(
  "devices",
  async () => {
    const { data, error } = await client
      .from("device")
      .select("id,name,description");
    err.value = error;
    return data;
  }
);

// Once page is mounted, listen to changes on the `collaborators` table and refresh collaborators when receiving event
onMounted(() => {
  // Real time listener for new workouts
  realtimeChannel = client
    .channel("public:device")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "device" },
      () => refreshDevices()
    );
  realtimeChannel.subscribe();
});
// Don't forget to unsubscribe when user left the page
onUnmounted(() => {
  client.removeChannel(realtimeChannel);
});
</script>
