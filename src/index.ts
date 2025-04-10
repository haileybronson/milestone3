import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("./views/home/HomeView.vue")
		},
		{
			path: "/about",
			name: "about",
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import("./views/about/AboutView.vue")
		},
		{
			path: "/recipes",
			name: "recipes",
			component: () => import("./components/Recipe.vue"),
			meta: { requiresAuth: true }
		}
	]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem("token")
	if (to.matched.some((record) => record.meta.requiresAuth) && !token) {
		next("/")
	} else {
		next()
	}
})

export default router
