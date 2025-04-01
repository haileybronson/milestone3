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
	if (!imagePath)
		return "https://via.placeholder.com/400x300?text=No+Image+Available"
	if (imagePath.startsWith("http")) return imagePath
	return `${import.meta.env.VITE_AWS_S3_URL}/${imagePath}`
}

const handleImageError = async (error: Event, recipe: any) => {
	console.error("Image failed to load for recipe:", recipe.name)
	console.error("Image URL:", recipe.recipe_cover_picture)
	console.error("Error details:", error)
	recipe.recipe_cover_picture =
		"https://via.placeholder.com/400x300?text=Recipe+Image+Not+Available"
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
		console.log("Raw API Response:", response)

		if (!Array.isArray(response)) {
			console.error("Expected array response but got:", typeof response)
			return
		}

		recipes.value = response.map((recipe) => ({
			id: recipe.id,
			name: recipe.name,
			description: recipe.description,
			recipe_cover_picture: recipe.recipe_cover_picture,
			inventory_total_qty: recipe.inventory_total_qty,
			checked_qty: recipe.checked_qty
		}))

		console.log("Processed recipes:", recipes.value)
	} catch (error) {
		console.error("Error loading recipes:", error)
		if (error.response) {
			console.error("Error response data:", error.response.data)
			console.error("Error response status:", error.response.status)
			console.error("Error response headers:", error.response.headers)
		}
		if (error.response?.status === 401) {
			store.dispatch("auth/logout")
			router.push("/")
		}
	}
}

const handleFileInput = (event: Event | File | null) => {
	if (!event) {
		console.log("No file selected")
		newRecipe.value.image = null
		return
	}

	// If event is a File object
	if (event instanceof File) {
		console.log("File input changed (File object):", event)
		console.log("File details:", {
			name: event.name,
			type: event.type,
			size: event.size,
			lastModified: event.lastModified
		})

		// Accept any image file
		if (!event.type.startsWith("image/")) {
			alert("Please select an image file")
			newRecipe.value.image = null
			return
		}

		// Validate file size (max 2MB)
		if (event.size > 2 * 1024 * 1024) {
			alert("File size must be less than 2MB")
			newRecipe.value.image = null
			return
		}

		newRecipe.value.image = event
		console.log("Updated newRecipe.image:", newRecipe.value.image)
	} else {
		// If event is an Event object
		const target = event.target as HTMLInputElement
		if (target && target.files && target.files[0]) {
			const file = target.files[0]
			console.log("File input changed (Event):", file)
			console.log("File details:", {
				name: file.name,
				type: file.type,
				size: file.size,
				lastModified: file.lastModified
			})

			// Accept any image file
			if (!file.type.startsWith("image/")) {
				alert("Please select an image file")
				newRecipe.value.image = null
				return
			}

			// Validate file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				alert("File size must be less than 2MB")
				newRecipe.value.image = null
				return
			}

			newRecipe.value.image = file
			console.log("Updated newRecipe.image:", newRecipe.value.image)
		} else {
			console.log("No file selected")
			newRecipe.value.image = null
		}
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
		const formData = new FormData()
		formData.append("name", newRecipe.value.name)
		formData.append("description", newRecipe.value.description)
		if (newRecipe.value.image) {
			console.log("Appending file to FormData:", {
				fileName: newRecipe.value.image.name,
				fileType: newRecipe.value.image.type,
				fileSize: newRecipe.value.image.size
			})
			formData.append("recipe_cover_picture", newRecipe.value.image)
		}

		// Debug logging for FormData
		console.log("FormData entries:")
		for (let pair of formData.entries()) {
			if (pair[1] instanceof File) {
				console.log(
					`${pair[0]}: File(${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)`
				)
			} else {
				console.log(`${pair[0]}: ${pair[1]}`)
			}
		}

		if (isEditing.value && editingRecipeId.value) {
			const response = await RecipeService.updateRecipe(
				editingRecipeId.value,
				formData
			)
			console.log("Update response:", response)
		} else {
			const response = await RecipeService.createRecipe(formData)
			console.log("Create response:", response)
		}
		await loadRecipes()
		closeDialog()
	} catch (error) {
		console.error("Error saving recipe:", error)
		if (error.response) {
			console.error("Error response data:", error.response.data)
			console.error("Error response status:", error.response.status)
			if (error.response.status === 422) {
				const validationErrors = error.response.data.data
				console.error("Validation errors:", validationErrors)
				// Show detailed error message
				let errorMessage = "Validation failed:\n"
				if (typeof validationErrors === "object") {
					for (const [field, messages] of Object.entries(
						validationErrors
					)) {
						errorMessage += `${field}: ${
							Array.isArray(messages)
								? messages.join(", ")
								: messages
						}\n`
					}
				} else {
					errorMessage += JSON.stringify(validationErrors, null, 2)
				}
				alert(errorMessage)
			}
		}
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
