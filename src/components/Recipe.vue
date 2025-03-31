<template>
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
				<v-card class="mx-auto" max-width="400">
					<v-img
						:src="getImageUrl(recipe.recipe_cover_picture)"
						height="200"
						cover
						class="align-end"
						@error="(e) => handleImageError(e, recipe)"
					>
						<v-card-title class="text-white bg-black bg-opacity-50">
							{{ recipe.name }}
						</v-card-title>
					</v-img>
					<v-card-text>
						<div class="text-subtitle-1 py-2">
							{{ recipe.description }}
						</div>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn icon @click="editRecipe(recipe)">
							<v-icon>mdi-pencil</v-icon>
						</v-btn>
						<v-btn icon @click="confirmDelete(recipe)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>

		<!-- Add/Edit Recipe Dialog -->
		<v-dialog v-model="showAddRecipeDialog" max-width="500px">
			<v-card>
				<v-card-title>{{
					isEditing ? "Edit Recipe" : "Add New Recipe"
				}}</v-card-title>
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
							:rules="[
								(v) =>
									isEditing
										? true
										: !!v || 'Image is required'
							]"
							:required="!isEditing"
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
						{{ isEditing ? "Update" : "Save" }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Delete Confirmation Dialog -->
		<v-dialog v-model="showDeleteDialog" max-width="300px">
			<v-card>
				<v-card-title>Delete Recipe</v-card-title>
				<v-card-text
					>Are you sure you want to delete this recipe?</v-card-text
				>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" text @click="showDeleteDialog = false"
						>Cancel</v-btn
					>
					<v-btn color="primary" @click="deleteRecipe">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
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
const showDeleteDialog = ref(false)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingRecipeId = ref(null)
const recipeToDelete = ref(null)

const newRecipe = ref({
	name: "",
	description: "",
	image: null
})

const getImageUrl = (imagePath: string) => {
	const baseUrl = import.meta.env.VITE_AWS_S3_URL
	return `${baseUrl}/${imagePath}`
}

const handleImageError = async (error: Event, recipe: any) => {
	console.error("Image failed to load for recipe:", recipe.name)
	console.error("Image URL:", recipe.recipe_cover_picture)
	console.error("Error details:", error)

	try {
		const response = await fetch(getImageUrl(recipe.recipe_cover_picture), {
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
		recipe.recipe_cover_picture =
			"https://via.placeholder.com/400x300?text=Recipe+Image+Not+Available"
	}
}

const loadRecipes = async () => {
	console.log("Loading recipes...")
	try {
		const authState = store.state.auth
		console.log("Auth state:", authState)

		if (!authState.status.loggedIn) {
			console.error("Not logged in according to Vuex state")
			router.push("/")
			return
		}

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
		recipes.value = response
	} catch (error) {
		console.error("Error loading recipes:", error)
		if (error.response?.status === 401) {
			store.dispatch("auth/logout")
			router.push("/")
		}
	}
}

const handleFileInput = (file: File) => {
	if (file) {
		newRecipe.value.image = file
	}
}

const editRecipe = (recipe: any) => {
	isEditing.value = true
	editingRecipeId.value = recipe.id
	newRecipe.value = {
		name: recipe.name,
		description: recipe.description,
		image: null
	}
	showAddRecipeDialog.value = true
}

const confirmDelete = (recipe: any) => {
	recipeToDelete.value = recipe
	showDeleteDialog.value = true
}

const deleteRecipe = async () => {
	try {
		await RecipeService.deleteRecipe(recipeToDelete.value.id)
		await loadRecipes()
		showDeleteDialog.value = false
		recipeToDelete.value = null
	} catch (error) {
		console.error("Error deleting recipe:", error)
	}
}

const closeDialog = () => {
	showAddRecipeDialog.value = false
	isEditing.value = false
	editingRecipeId.value = null
	newRecipe.value = { name: "", description: "", image: null }
}

const submitRecipe = async () => {
	if (!isFormValid.value) return

	isSubmitting.value = true
	try {
		if (isEditing.value) {
			await RecipeService.updateRecipe(
				editingRecipeId.value,
				newRecipe.value
			)
		} else {
			await RecipeService.createRecipe(newRecipe.value)
		}
		await loadRecipes()
		closeDialog()
	} catch (error) {
		console.error("Error saving recipe:", error)
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
