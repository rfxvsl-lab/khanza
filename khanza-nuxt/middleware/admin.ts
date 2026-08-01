export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;

  const token = localStorage.getItem('adminToken');
  if (!token) {
    return navigateTo('/admin');
  }
});
