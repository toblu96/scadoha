// plugins/pocketbase.js
import PocketBase, { Admin, Record } from "pocketbase";
import { useRouter } from "#app";
interface ICookie {
  token: string;
  model: Record | Admin | null;
}

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();
  const pb = new PocketBase(runtimeConfig.public.pbBaseUrl);
  const user = usePocketbaseUser();
  const router = useRouter();

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
  pb.authStore.onChange(async () => {
    // check if user was already logged in
    let isUserAlreadyLoggedIn = cookie.value?.token != "";

    cookie.value = {
      token: pb.authStore.token,
      model: pb.authStore.model,
    };

    // update state in composable
    // user.value = null; // prevent hydration error if login called a second time from other user without logout first
    let avatarUrl = undefined;
    if (pb.authStore.model) {
      try {
        let userRecord = await pb
          .collection("users")
          .getOne(pb.authStore.model.id, { $autoCancel: false });
        avatarUrl = pb.getFileUrl(userRecord, pb.authStore.model.avatar);
      } catch (error) {
        console.error(error);
      }
    }
    pb.authStore.isValid && pb.authStore.model
      ? (user.value = {
          avatar: pb.authStore.model.avatar && avatarUrl ? avatarUrl : "",
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

    // login/logout redirect
    if (pb.authStore.isValid && !isUserAlreadyLoggedIn) {
      router.push({ path: "/" });
    }
    if (!pb.authStore.isValid) {
      router.push({ path: "/login" });
    }
  });

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    if (pb.authStore.isValid && pb.authStore.model) {
      await pb.collection("users").authRefresh();
      let avatarUrl = "";
      if (pb.authStore.model) {
        try {
          let userRecord = await pb
            .collection("users")
            .getOne(pb.authStore.model.id, { $autoCancel: false });
          avatarUrl = pb.getFileUrl(userRecord, pb.authStore.model.avatar);
        } catch (error) {
          console.error(error);
        }
      }
      user.value = {
        avatar: pb.authStore.model.avatar ? avatarUrl : "",
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

  // define middleware inline
  addRouteMiddleware(
    "pocketbase-auth",
    (to) => {
      // Do not redirect for login and callback pages
      if (["/login"].includes(to.path)) {
        return;
      }
      // check if user is logged in
      if (!useNuxtApp().$pb.authStore.isValid) {
        return "/login";
      }
    },
    { global: true }
  );

  return {
    provide: { pb },
  };
});
