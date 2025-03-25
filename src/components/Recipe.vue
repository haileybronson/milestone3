<template>
	<div>
		<v-container>
			<v-row>
				<v-col cols="12">
					<v-btn color="primary" @click="showAddRecipeDialog = true">
						Add New Recipe
					</v-btn>
				</v-col>
			</v-row>
			<v-row>
				<v-col
					v-for="recipe in recipes"
					:key="recipe.id"
					cols="12"
					sm="6"
					md="4"
				>
					<v-card>
						<v-img
							:src="recipe.recipe_cover_picture"
							height="200"
							cover
							class="align-end"
							@error="(e) => handleImageError(e, recipe)"
						>
							<v-card-title
								class="text-white bg-black bg-opacity-50 pb-0"
							>
								{{ recipe.name }}
							</v-card-title>
						</v-img>
						<v-card-text>
							<div class="pt-4">{{ recipe.description }}</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>

		<!-- Add Recipe Dialog -->
		<v-dialog v-model="showAddRecipeDialog" max-width="500px">
			<v-card>
				<v-card-title>Add New Recipe</v-card-title>
				<v-card-text>
					<v-form
						v-model="isFormValid"
						@submit.prevent="submitRecipe"
					>
						<v-text-field
							v-model="newRecipe.name"
							label="Recipe Name"
							:rules="[(v) => !!v || 'Name is required']"
							required
						></v-text-field>
						<v-textarea
							v-model="newRecipe.description"
							label="Description"
							:rules="[(v) => !!v || 'Description is required']"
							required
						></v-textarea>
						<v-file-input
							v-model="newRecipe.image"
							label="Recipe Image"
							accept="image/*"
							:rules="[(v) => !!v || 'Image is required']"
							required
							@change="handleFileInput"
						></v-file-input>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" @click="closeDialog">Cancel</v-btn>
					<v-btn
						color="primary"
						:disabled="!isFormValid"
						:loading="isSubmitting"
						@click="submitRecipe"
					>
						Save
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import RecipeService from "@/services/recipe.service"
import { useRouter } from "vue-router"
import { useStore } from "vuex"

const router = useRouter()
const store = useStore()
const recipes = ref([])
const showAddRecipeDialog = ref(false)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const newRecipe = ref({
	name: "",
	description: "",
	image: null
})

const loadRecipes = async () => {
	console.log("Loading recipes...")
	try {
		// Check Vuex auth state
		const authState = store.state.auth
		console.log("Auth state:", authState)

		if (!authState.status.loggedIn) {
			console.error("Not logged in according to Vuex state")
			router.push("/")
			return
		}

		// Check localStorage
		const userStr = localStorage.getItem("user")
		console.log("User from localStorage:", userStr)

		if (!userStr) {
			console.error("No user found in localStorage")
			store.dispatch("auth/logout")
			router.push("/")
			return
		}

		const user = JSON.parse(userStr)
		console.log("Parsed user object:", user)

		if (!user || !user.token) {
			console.error("No valid token found in user object")
			store.dispatch("auth/logout")
			router.push("/")
			return
		}

		console.log("Making API request with token:", user.token)
		const response = await RecipeService.getRecipes()
		console.log("Recipes loaded successfully:", response)

		// Log each recipe's image URL
		response.forEach((recipe) => {
			console.log(
				`Recipe: ${recipe.name}, Image URL: ${recipe.recipe_cover_picture}`
			)
		})

		recipes.value = response
	} catch (error) {
		console.error("Error loading recipes:", error)
		console.error("Error response:", error.response)
		console.error("Error request config:", error.config)

		if (error.response?.status === 401) {
			console.log("Unauthorized, logging out and redirecting to login")
			store.dispatch("auth/logout")
			router.push("/")
		}
	}
}

const handleImageError = async (error, recipe) => {
	console.error("Image failed to load for recipe:", recipe.name)
	console.error("Image URL:", recipe.recipe_cover_picture)
	console.error("Error details:", error)

	try {
		const response = await fetch(recipe.recipe_cover_picture, {
			mode: "cors",
			headers: {
				Accept: "image/*"
			}
		})

		console.log(`Image fetch response for ${recipe.name}:`, {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries())
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
	} catch (error) {
		console.error(`Fetch error for ${recipe.name}:`, error)
		// Set a fallback image URL if the original fails
		recipe.recipe_cover_picture =
			"https://via.placeholder.com/400x300?text=Recipe+Image+Not+Available"
	}
}

const handleFileInput = (file) => {
	if (file) {
		newRecipe.value.image = file
	}
}

const closeDialog = () => {
	showAddRecipeDialog.value = false
	newRecipe.value = { name: "", description: "", image: null }
}

const submitRecipe = async () => {
	if (!isFormValid.value) return

	isSubmitting.value = true
	try {
		const response = await RecipeService.createRecipe(newRecipe.value)
		console.log("Recipe created:", response)
		await loadRecipes()
		closeDialog()
	} catch (error) {
		console.error("Error creating recipe:", error)
	} finally {
		isSubmitting.value = false
	}
}

onMounted(() => {
	console.log("Recipe component mounted")
	loadRecipes()
})
</script>

<style scoped>
.v-card-title {
	word-break: break-word;
}
</style>
