<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Tags</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all the tags in your project.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add tag
        </button>
      </div>
    </div>
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
          >
            <div
              v-if="selected.length > 0"
              class="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16"
            >
              <button
                type="button"
                class="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Bulk edit
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Delete all
              </button>
            </div>
            <table class="min-w-full table-fixed divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                      :checked="
                        indeterminate ||
                        (selected.length === maxTagCount && maxTagCount != 0)
                      "
                      :indeterminate="indeterminate"
                      @change="
                        // @ts-ignore
                        selected = $event.target?.checked
                          ? selectAllTagIds()
                          : []
                      "
                    />
                  </th>
                  <th
                    scope="col"
                    class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Topic
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Updated
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <template v-for="tagGroup in brokerTags" :key="tagGroup.id">
                  <tr
                    v-if="tagGroup.expand['mqtt_tag(broker)']"
                    class="border-t border-gray-200"
                  >
                    <th
                      colspan="6"
                      scope="colgroup"
                      class="bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 sm:px-6"
                    >
                      {{ tagGroup.name }}
                    </th>
                  </tr>
                  <tr
                    v-for="tag in tagGroup.expand['mqtt_tag(broker)']"
                    :key="tag.id"
                    :class="[selected.includes(tag.id) && 'bg-gray-50']"
                  >
                    <td class="relative w-12 px-6 sm:w-16 sm:px-8">
                      <div
                        v-if="selected.includes(tag.id)"
                        class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"
                      ></div>
                      <input
                        type="checkbox"
                        class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                        :value="tag.id"
                        v-model="selected"
                      />
                    </td>
                    <td
                      :class="[
                        'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                        selected.includes(tag.id)
                          ? 'text-indigo-600'
                          : 'text-gray-900',
                      ]"
                    >
                      {{ tag.name }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ tag.description }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ tag.topic }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ new Date(tag.updated).toDateString() }}
                    </td>
                    <td
                      class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <a href="#" class="text-indigo-600 hover:text-indigo-900"
                        >Edit<span class="sr-only">, {{ tag.name }}</span></a
                      >
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";
interface IBrokerTags {
  id: string;
  name: string;
  expand: {
    "mqtt_tag(broker)": ITags[];
  };
}
interface ITags {
  id: string;
  name: string;
  description: string;
  topic: string;
  created: Date;
  updated: Date;
}

const props = defineProps({
  brokerTags: {
    required: false,
    type: Array as PropType<IBrokerTags[]>,
  },
});

const selected = ref<string[]>([]);
const checked = ref(false);
let maxTagCount = 0;
props.brokerTags?.forEach((tag) => {
  if (tag.expand["mqtt_tag(broker)"]?.length)
    maxTagCount += tag.expand["mqtt_tag(broker)"]?.length;
});
const indeterminate = computed(
  () => selected.value.length > 0 && selected.value.length < maxTagCount
);

const selectAllTagIds = () => {
  let ids: string[] = [];
  props.brokerTags?.forEach((brokerTag) => {
    if (!brokerTag.expand["mqtt_tag(broker)"]) return;
    ids.push(...brokerTag.expand["mqtt_tag(broker)"]?.map((p) => p.id));
  });
  return ids;
};
</script>
