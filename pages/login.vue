<template>
  <div>hello from supabase page! Try to login here..</div>
  <input type="text" v-model="username" placeholder="username" />
  <input type="password" v-model="password" placeholder="password" />
  <button @click="signUp(username, password)">SignUp</button>
  <button @click="signIn(username, password)">LogIn</button>
  {{ error }}
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const client = useSupabaseAuthClient();

const username = ref("");
const password = ref("");
const error = ref("");

watchEffect(() => {
  if (user.value) {
    navigateTo("/dashboard");
  }
});

const signUp = async (email: string, password: string) => {
  let resp = await client.auth.signUp({
    email,
    password,
  });

  if (resp.error) {
    error.value = resp.error.message;
  }
};
const signIn = async (email: string, password: string) => {
  let resp = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (resp.error) {
    error.value = resp.error.message;
  }
};
</script>
