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
				class="d-flex"
			>
				<v-card
					class="mx-auto mb-4 flex-grow-1"
					min-width="300"
					max-width="450"
					:class="{
						unavailable:
							recipe.checked_qty >= recipe.inventory_total_qty
					}"
				>
					<v-img
						:src="getImageUrl(recipe.recipe_cover_picture)"
						height="200"
						cover
						class="align-end"
						@error="(e) => handleImageError(e, recipe)"
						:style="
							recipe.checked_qty >= recipe.inventory_total_qty
								? 'opacity: 0.5;'
								: ''
						"
					>
						<v-card-item>
							<v-card-title
								class="text-h6 bg-black bg-opacity-60 text-white px-2 rounded"
							>
								{{ recipe.name }}
							</v-card-title>
						</v-card-item>
					</v-img>
					<v-card-text>
						<p>{{ recipe.description }}</p>

						<!-- Tags Display -->
						<div
							v-if="recipe.tags && recipe.tags.length > 0"
							class="mt-2"
						>
							<v-chip-group>
								<v-chip
									v-for="tag in recipe.tags"
									:key="tag.id"
									size="small"
									color="primary"
									variant="outlined"
									class="mr-1"
								>
									{{ tag.name }}
								</v-chip>
							</v-chip-group>
						</div>

						<!-- Ingredients Display -->
						<div
							v-if="
								recipe.ingredients &&
								recipe.ingredients.length > 0
							"
							class="mt-2"
						>
							<v-expansion-panels variant="accordion">
								<v-expansion-panel>
									<v-expansion-panel-title>
										<v-icon class="mr-2"
											>mdi-food-variant</v-icon
										>
										Ingredients ({{
											recipe.ingredients.length
										}})
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-list density="compact" class="pa-0">
											<v-list-item
												v-for="ingredient in recipe.ingredients"
												:key="ingredient.id"
												class="px-0"
											>
												<v-list-item-title>
													{{ ingredient.name }}
													<span
														v-if="
															ingredient.pivot
																.quantity
														"
													>
														-
														{{
															ingredient.pivot
																.quantity
														}}
														{{ ingredient.unit }}
													</span>
												</v-list-item-title>
												<v-list-item-subtitle
													v-if="
														ingredient.pivot.notes
													"
												>
													{{ ingredient.pivot.notes }}
												</v-list-item-subtitle>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</div>

						<!-- Nutrition Info Display -->
						<div v-if="recipe.nutritionInfo" class="mt-2">
							<v-expansion-panels variant="accordion">
								<v-expansion-panel>
									<v-expansion-panel-title>
										<v-icon class="mr-2"
											>mdi-nutrition</v-icon
										>
										Nutrition Facts
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-list density="compact" class="pa-0">
											<v-list-item
												v-if="
													recipe.nutritionInfo
														.calories
												"
												class="px-0"
											>
												<v-list-item-title>
													Calories:
													{{
														recipe.nutritionInfo
															.calories
													}}
												</v-list-item-title>
											</v-list-item>
											<v-list-item
												v-if="
													recipe.nutritionInfo.protein
												"
												class="px-0"
											>
												<v-list-item-title>
													Protein:
													{{
														recipe.nutritionInfo
															.protein
													}}g
												</v-list-item-title>
											</v-list-item>
											<v-list-item
												v-if="
													recipe.nutritionInfo.carbs
												"
												class="px-0"
											>
												<v-list-item-title>
													Carbs:
													{{
														recipe.nutritionInfo
															.carbs
													}}g
												</v-list-item-title>
											</v-list-item>
											<v-list-item
												v-if="recipe.nutritionInfo.fat"
												class="px-0"
											>
												<v-list-item-title>
													Fat:
													{{
														recipe.nutritionInfo
															.fat
													}}g
												</v-list-item-title>
											</v-list-item>
											<v-list-item
												v-if="
													recipe.nutritionInfo.fiber
												"
												class="px-0"
											>
												<v-list-item-title>
													Fiber:
													{{
														recipe.nutritionInfo
															.fiber
													}}g
												</v-list-item-title>
											</v-list-item>
											<v-list-item
												v-if="
													recipe.nutritionInfo.sugar
												"
												class="px-0"
											>
												<v-list-item-title>
													Sugar:
													{{
														recipe.nutritionInfo
															.sugar
													}}g
												</v-list-item-title>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</div>

						<!-- Creator Info Display -->
						<div
							v-if="recipe.user"
							class="mt-2 d-flex align-center"
						>
							<v-icon class="mr-2">mdi-account</v-icon>
							<span>Created by: {{ recipe.user.name }}</span>
						</div>

						<div class="mt-2">
							<v-badge
								:color="
									recipe.checked_qty === 0
										? 'success'
										: 'warning'
								"
								:content="
									recipe.checked_qty +
									'/' +
									recipe.inventory_total_qty
								"
								inline
							>
								Status:
							</v-badge>
							<span
								:class="{
									'text-success':
										recipe.checked_qty <
										recipe.inventory_total_qty,
									'text-warning':
										recipe.checked_qty ===
										recipe.inventory_total_qty
								}"
								class="ml-2"
							>
								{{
									recipe.checked_qty <
									recipe.inventory_total_qty
										? "Available"
										: "In Use"
								}}
							</span>
						</div>
					</v-card-text>
					<v-card-actions>
						<template
							v-if="
								recipe.checked_qty < recipe.inventory_total_qty
							"
						>
							<v-btn
								color="primary"
								@click="checkoutRecipe(recipe)"
								class="mr-2"
							>
								Save for Cooking
							</v-btn>
						</template>
						<template v-else>
							<v-btn
								color="success"
								@click="returnRecipe(recipe)"
								class="mr-2"
							>
								Mark as Done
							</v-btn>
						</template>
						<v-spacer></v-spacer>
						<div class="d-flex">
							<v-btn
								icon
								@click="editRecipe(recipe)"
								class="mr-2"
							>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
							<v-btn
								icon
								@click="confirmDelete(recipe)"
								color="error"
								:disabled="recipe.checked_qty > 0"
							>
								<v-tooltip activator="parent" location="top">
									<span v-if="recipe.checked_qty > 0"
										>Cannot delete recipe while it is in
										use</span
									>
									<span v-else>Delete recipe</span>
								</v-tooltip>
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</div>
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

		recipes.value = response
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

const handleFileInput = (event: Event) => {
	const input = event.target as HTMLInputElement
	if (!input.files?.length) {
		newRecipe.value.image = null
		return
	}

	const file = input.files[0]
	console.log("File details:", {
		name: file.name,
		type: file.type,
		size: file.size
	})

	// Check file type
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/svg+xml"
	]
	if (!allowedTypes.includes(file.type)) {
		alert("Please select a valid image file (JPEG, PNG, GIF, or SVG)")
		newRecipe.value.image = null
		return
	}

	// Check file size (10MB limit)
	const maxSize = 10 * 1024 * 1024 // 10MB in bytes
	if (file.size > maxSize) {
		alert("File size must be less than 10MB")
		newRecipe.value.image = null
		return
	}

	newRecipe.value.image = file
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
	// Don't allow deletion if recipe is checked out
	if (recipe.checked_qty > 0) {
		alert(
			"Cannot delete recipe while it is in use. Please wait until it is marked as done."
		)
		return
	}
	recipeToDelete.value = recipe
	showDeleteDialog.value = true
}

const deleteRecipe = async () => {
	if (!recipeToDelete.value) return

	try {
		const recipeName = recipeToDelete.value.name
		console.log("Deleting recipe:", recipeName)
		await RecipeService.deleteRecipe(recipeToDelete.value.id)
		console.log("Recipe deleted successfully")
		await loadRecipes() // Refresh the list
		showDeleteDialog.value = false
		recipeToDelete.value = null
		alert(`Recipe "${recipeName}" was deleted successfully!`)
	} catch (error) {
		console.error("Error deleting recipe:", error)
		if (error.response) {
			console.error("Error response data:", error.response.data)
			alert("Failed to delete recipe: " + error.response.data.message)
		} else {
			alert("Failed to delete recipe. Please try again.")
		}
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
			alert(`Recipe "${newRecipe.value.name}" was updated successfully!`)
		} else {
			const response = await RecipeService.createRecipe(formData)
			console.log("Create response:", response)
			alert(`Recipe "${newRecipe.value.name}" was created successfully!`)
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

const checkoutRecipe = async (recipe: any) => {
	try {
		console.log("Checking out recipe:", recipe.name)
		const response = await RecipeService.checkoutRecipe(recipe.id)
		console.log("Checkout response:", response)
		await loadRecipes() // Refresh the list to show updated status
	} catch (error) {
		console.error("Error checking out recipe:", error)
		alert("Failed to save recipe for cooking")
	}
}

const returnRecipe = async (recipe: any) => {
	try {
		console.log("Returning recipe:", recipe.name)
		const response = await RecipeService.returnRecipe(recipe.id)
		console.log("Return response:", response)
		await loadRecipes() // Refresh the list to show updated status
	} catch (error) {
		console.error("Error returning recipe:", error)
		alert("Failed to mark recipe as done")
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

.unavailable {
	position: relative;
}

.unavailable::after {
	content: "Recipe in Use";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 8px 16px;
	border-radius: 4px;
	z-index: 1;
}
</style>
