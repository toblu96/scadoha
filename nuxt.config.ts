// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "@nuxt/devtools"],
  runtimeConfig: {
    pbMqttServiceAccountUsername: "service_users13639",
    pbMqttServiceAccountPassword: "secret",
    public: {
      pbBaseUrl: "http://127.0.0.1:8090", // can be overridden by NUXT_PUBLIC_PB_BASE_URL environment variable
    },
  },
});
