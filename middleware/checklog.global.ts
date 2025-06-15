export default defineNuxtRouteMiddleware((to) => {
  const isLoggedIn = useCookie<boolean>('isLoggedIn')
   
  // Define a list of public routes that don't require authentication
  const publicPaths = ['/', '/login', '/signin']
  const logPaths = ['/login', '/signin']
  const adminPaths = ['/AdminPosilek','/AdminProdukt','/AdminUzytkownik']

  // If user is NOT logged in and trying to access a protected route
  if (!isLoggedIn.value && !publicPaths.includes(to.path)) {
    return navigateTo('/')
  }
  if (isLoggedIn.value && logPaths.includes(to.path)) {
    return navigateTo('/logged')
  }
  if(adminPaths.includes(to.path)){
    return navigateTo('/')
  }
})