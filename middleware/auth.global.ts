export default defineNuxtRouteMiddleware((to, from) => {
  // Do not redirect for login and callback pages
  if (["/login"].includes(to.path)) {
    return;
  }
  // check if user is logged in
  if (!useNuxtApp().$pb.authStore.isValid) {
    return "/login";
  }
});
