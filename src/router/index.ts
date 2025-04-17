import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/home/HomeView.vue"
import RecipeView from "../views/recipe/RecipeView.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView
		},
		{
			path: "/about",
			name: "about",
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import("../views/about/AboutView.vue")
		},
		{
			path: "/recipes",
			name: "recipes",
			component: RecipeView,
			meta: { requiresAuth: true }
		}
	]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
	const userStr = localStorage.getItem("user")
	const user = userStr ? JSON.parse(userStr) : null

	if (to.matched.some((record) => record.meta.requiresAuth)) {
		if (!user || !user.token) {
			next("/")
		} else {
			next()
		}
	} else {
		next()
	}
})

export default router
