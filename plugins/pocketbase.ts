// plugins/pocketbase.js
import PocketBase, { Admin, Record } from "pocketbase";

interface ICookie {
  token: string;
  model: Record | Admin | null;
}

export default defineNuxtPlugin(async () => {
  const pb = new PocketBase("http://127.0.0.1:8090");
  const user = usePocketbaseUser();

  const cookie = useCookie<ICookie>("pb_auth", {
    path: "/",
    secure: true,
    sameSite: "strict",
    httpOnly: false, // change to "true" if you want only server-side access
    maxAge: 604800,
  });

  // load the store data from the cookie value
  pb.authStore.save(cookie.value?.token || "", cookie.value?.model || null);

  // send back the default 'pb_auth' cookie to the client with the latest store state
  pb.authStore.onChange(() => {
    cookie.value = {
      token: pb.authStore.token,
      model: pb.authStore.model,
    };

    // update state in composable
    user.value = null; // prevent hydration error if login called a second time from other user without logout first
    pb.authStore.isValid && pb.authStore.model
      ? (user.value = {
          avatar: pb.authStore.model.avatar,
          created: pb.authStore.model.created,
          email: pb.authStore.model.email,
          id: pb.authStore.model.id,
          isNew: pb.authStore.model.isNew,
          updated: pb.authStore.model.updated,
          // @ts-ignore
          emailVisibility: pb.authStore.model.emailVisibility,
          name: pb.authStore.model.name,
          username: pb.authStore.model.username,
          verified: pb.authStore.model.verified,
        })
      : (user.value = null);
  });

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (pb.authStore.isValid && pb.authStore.model) {
      await pb.collection("users").authRefresh();
      user.value = {
        avatar: pb.authStore.model.avatar,
        created: pb.authStore.model.created,
        email: pb.authStore.model.email,
        id: pb.authStore.model.id,
        isNew: pb.authStore.model.isNew,
        updated: pb.authStore.model.updated,
        // @ts-ignore
        emailVisibility: pb.authStore.model.emailVisibility,
        name: pb.authStore.model.name,
        username: pb.authStore.model.username,
        verified: pb.authStore.model.verified,
      };
    }
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
    user.value = null;
  }

  return {
    provide: { pb },
  };
});
