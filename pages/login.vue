<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <h2
        class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
      >
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- error message -->
        <div v-if="error_message" class="mb-4">
          <div class="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon
                  class="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  {{ error_message }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="login">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Email address or username</label
            >
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="text"
                autocomplete="email"
                required
                v-model="email"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
              >Password</label
            >
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  layout: false,
});

const error_message = ref("");

const email = ref("");
const password = ref("");

const login = async () => {
  try {
    await useNuxtApp()
      .$pb.collection("users")
      .authWithPassword(email.value, password.value);
    error_message.value = "";
  } catch (error: any) {
    error_message.value = error.message;
  }
};
</script>
