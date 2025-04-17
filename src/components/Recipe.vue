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

						<!-- Dietary Preferences Display -->
						<div class="mt-2">
							<div class="d-flex flex-wrap gap-1">
								<v-chip
									v-if="recipe.is_vegan"
									size="x-small"
									color="green-lighten-1"
									class="mr-1 mb-1"
								>
									<v-icon size="x-small" start
										>mdi-leaf</v-icon
									>
									Vegan
								</v-chip>
								<v-chip
									v-if="recipe.is_vegetarian"
									size="x-small"
									color="light-green"
									class="mr-1 mb-1"
								>
									<v-icon size="x-small" start
										>mdi-food-apple</v-icon
									>
									Vegetarian
								</v-chip>
								<v-chip
									v-if="recipe.is_gluten_free"
									size="x-small"
									color="amber-lighten-1"
									class="mr-1 mb-1"
								>
									<v-icon size="x-small" start
										>mdi-barley-off</v-icon
									>
									Gluten Free
								</v-chip>
								<v-chip
									v-if="recipe.is_dairy_free"
									size="x-small"
									color="blue-grey-lighten-3"
									class="mr-1 mb-1"
								>
									<v-icon size="x-small" start
										>mdi-cow-off</v-icon
									>
									Dairy Free
								</v-chip>
								<v-chip
									v-if="recipe.is_nut_free"
									size="x-small"
									color="brown-lighten-2"
									class="mr-1 mb-1"
								>
									<v-icon size="x-small" start
										>mdi-peanut-off</v-icon
									>
									Nut Free
								</v-chip>
							</div>
						</div>

						<!-- Cooking Details Display -->
						<div
							class="d-flex align-center mt-2 gap-3 flex-wrap"
							v-if="
								recipe.prep_time_minutes ||
								recipe.cook_time_minutes ||
								recipe.difficulty
							"
						>
							<div
								v-if="recipe.prep_time_minutes"
								class="d-flex align-center"
							>
								<v-icon size="small" class="mr-1"
									>mdi-knife</v-icon
								>
								<span class="text-caption"
									>Prep:
									{{ recipe.prep_time_minutes }} min</span
								>
							</div>
							<div
								v-if="recipe.cook_time_minutes"
								class="d-flex align-center"
							>
								<v-icon size="small" class="mr-1"
									>mdi-stove</v-icon
								>
								<span class="text-caption"
									>Cook:
									{{ recipe.cook_time_minutes }} min</span
								>
							</div>
							<div
								v-if="recipe.difficulty"
								class="d-flex align-center"
							>
								<v-icon size="small" class="mr-1"
									>mdi-chef-hat</v-icon
								>
								<span class="text-caption text-capitalize">{{
									recipe.difficulty
								}}</span>
							</div>
						</div>

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
		<v-dialog v-model="showAddRecipeDialog" max-width="800px">
			<v-card>
				<v-card-title class="text-h5">{{
					isEditing ? "Edit Recipe" : "Add New Recipe"
				}}</v-card-title>
				<v-divider></v-divider>
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
							:disabled="isSubmitting"
							variant="outlined"
							density="comfortable"
						></v-text-field>
						<v-textarea
							v-model="newRecipe.description"
							label="Description"
							:rules="[(v) => !!v || 'Description is required']"
							required
							:disabled="isSubmitting"
							variant="outlined"
							density="comfortable"
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
							:disabled="isSubmitting"
							variant="outlined"
							show-size
							density="comfortable"
							prepend-icon="mdi-camera"
						></v-file-input>

						<!-- Dietary Preferences Section -->
						<v-card
							class="mb-4 pa-3"
							variant="outlined"
							:disabled="isSubmitting"
						>
							<v-card-title
								class="text-subtitle-1 pb-2 d-flex align-center"
							>
								<v-icon class="mr-2">mdi-food-apple</v-icon>
								Dietary Preferences
							</v-card-title>
							<v-row>
								<v-col cols="12" sm="4">
									<v-checkbox
										v-model="newRecipe.is_vegan"
										label="Vegan"
										hide-details
										:disabled="isSubmitting"
									></v-checkbox>
								</v-col>
								<v-col cols="12" sm="4">
									<v-checkbox
										v-model="newRecipe.is_vegetarian"
										label="Vegetarian"
										hide-details
										:disabled="isSubmitting"
									></v-checkbox>
								</v-col>
								<v-col cols="12" sm="4">
									<v-checkbox
										v-model="newRecipe.is_gluten_free"
										label="Gluten Free"
										hide-details
										:disabled="isSubmitting"
									></v-checkbox>
								</v-col>
								<v-col cols="12" sm="4">
									<v-checkbox
										v-model="newRecipe.is_dairy_free"
										label="Dairy Free"
										hide-details
										:disabled="isSubmitting"
									></v-checkbox>
								</v-col>
								<v-col cols="12" sm="4">
									<v-checkbox
										v-model="newRecipe.is_nut_free"
										label="Nut Free"
										hide-details
										:disabled="isSubmitting"
									></v-checkbox>
								</v-col>
							</v-row>
						</v-card>

						<!-- Cooking Details Section -->
						<v-card
							class="mb-4 pa-3"
							variant="outlined"
							:disabled="isSubmitting"
						>
							<v-card-title class="text-subtitle-1 pb-2"
								>Cooking Details</v-card-title
							>
							<v-row>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.prep_time_minutes
										"
										label="Prep Time (minutes)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.cook_time_minutes
										"
										label="Cook Time (minutes)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-select
										v-model="newRecipe.difficulty"
										label="Difficulty"
										:items="['easy', 'medium', 'hard']"
										hide-details
										:disabled="isSubmitting"
									></v-select>
								</v-col>
							</v-row>
						</v-card>

						<!-- Tags Section -->
						<v-card
							class="mb-4 pa-3"
							variant="outlined"
							:disabled="isSubmitting"
						>
							<v-card-title class="text-subtitle-1 pb-2"
								>Tags</v-card-title
							>
							<v-combobox
								v-model="newRecipe.tags"
								:items="availableTags"
								item-title="name"
								item-value="id"
								chips
								multiple
								label="Select Tags"
								@update:search="searchTags"
								:disabled="isSubmitting"
							>
								<template v-slot:selection="{ item }">
									<v-chip>{{ item.name || item.raw }}</v-chip>
								</template>
							</v-combobox>
						</v-card>

						<!-- Ingredients Section -->
						<v-card
							class="mb-4 pa-3"
							variant="outlined"
							:disabled="isSubmitting"
						>
							<v-card-title class="text-subtitle-1 pb-2">
								Ingredients
								<v-btn
									icon
									size="small"
									color="primary"
									class="ml-auto"
									@click="addIngredient"
									:disabled="isSubmitting"
								>
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</v-card-title>

							<div
								v-for="(
									ingredient, index
								) in newRecipe.ingredients"
								:key="index"
								class="d-flex align-center mb-2"
								:disabled="isSubmitting"
							>
								<v-autocomplete
									v-model="ingredient.id"
									:items="availableIngredients"
									item-title="name"
									item-value="id"
									label="Ingredient"
									hide-details
									class="mr-2"
									@update:search="searchIngredients"
									:disabled="isSubmitting"
								></v-autocomplete>
								<v-text-field
									v-model="ingredient.quantity"
									label="Quantity"
									type="number"
									hide-details
									class="mr-2"
									style="max-width: 100px"
									:disabled="isSubmitting"
								></v-text-field>
								<v-text-field
									v-model="ingredient.notes"
									label="Notes (e.g., sliced)"
									hide-details
									class="mr-2"
									:disabled="isSubmitting"
								></v-text-field>
								<v-btn
									icon
									color="error"
									size="small"
									@click="removeIngredient(index)"
									:disabled="isSubmitting"
								>
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</div>
							<div
								v-if="newRecipe.ingredients.length === 0"
								class="text-center pa-2"
								:disabled="isSubmitting"
							>
								No ingredients added. Click the + button to add
								ingredients.
							</div>
						</v-card>

						<!-- Nutrition Info Section -->
						<v-card
							class="mb-4 pa-3"
							variant="outlined"
							:disabled="isSubmitting"
						>
							<v-card-title class="text-subtitle-1 pb-2"
								>Nutrition Information</v-card-title
							>
							<v-row>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.nutrition.calories
										"
										label="Calories"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.nutrition.protein
										"
										label="Protein (g)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.nutrition.carbs
										"
										label="Carbs (g)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="newRecipe.nutrition.fat"
										label="Fat (g)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.nutrition.fiber
										"
										label="Fiber (g)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12" sm="4">
									<v-text-field
										v-model.number="
											newRecipe.nutrition.sugar
										"
										label="Sugar (g)"
										type="number"
										min="0"
										hide-details
										:disabled="isSubmitting"
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-textarea
										v-model="newRecipe.nutrition.notes"
										label="Nutrition Notes"
										rows="2"
										hide-details
										:disabled="isSubmitting"
									></v-textarea>
								</v-col>
							</v-row>
						</v-card>

						<!-- Form Error Alert -->
						<v-alert
							v-if="formError"
							type="error"
							variant="tonal"
							closable
							class="mt-4"
							@click:close="formError = ''"
						>
							{{ formError }}
						</v-alert>
					</v-form>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="error"
						@click="closeDialog"
						:disabled="isSubmitting"
						>Cancel</v-btn
					>
					<v-btn
						color="primary"
						:disabled="!isFormValid || isSubmitting"
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

		<!-- Snackbar for notifications -->
		<v-snackbar
			v-model="snackbar.show"
			:color="snackbar.color"
			:timeout="snackbar.timeout"
		>
			{{ snackbar.text }}
			<template v-slot:actions>
				<v-btn variant="text" @click="snackbar.show = false"
					>Close</v-btn
				>
			</template>
		</v-snackbar>
	</v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import RecipeService from "../services/recipe.service"
import TagService from "../services/tag.service"
import IngredientService from "../services/ingredient.service"
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
const availableTags = ref([])
const availableIngredients = ref([])
const snackbar = ref({
	show: false,
	text: "",
	color: "success",
	timeout: 5000
})
const formError = ref("")

// Define better types for recipe data
interface Ingredient {
	id: number | null
	name?: string
	quantity: number | null
	unit?: string
	notes: string
}

interface NutritionInfo {
	calories?: number | null
	protein?: number | null
	carbs?: number | null
	fat?: number | null
}

interface Recipe {
	id: number | null
	name: string
	description: string
	instructions: string
	prep_time_minutes: number | null
	cook_time_minutes: number | null
	serving_size: number | null
	difficulty: string
	is_vegetarian: boolean
	is_vegan: boolean
	is_gluten_free: boolean
	is_dairy_free: boolean
	is_nut_free: boolean
	image: File | null
	tags: number[]
	ingredients: Ingredient[]
	nutrition: NutritionInfo
}

// Fix the initial recipe object with proper typing
const newRecipe = ref<Recipe>({
	id: null,
	name: "",
	description: "",
	instructions: "",
	prep_time_minutes: null,
	cook_time_minutes: null,
	serving_size: null,
	difficulty: "easy",
	is_vegetarian: false,
	is_vegan: false,
	is_gluten_free: false,
	is_dairy_free: false,
	is_nut_free: false,
	image: null,
	tags: [],
	ingredients: [],
	nutrition: {
		calories: null,
		protein: null,
		carbs: null,
		fat: null
	}
})

// Fix the API_URL declaration to handle ImportMeta type
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000"

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

const loadTags = async () => {
	try {
		const response = await TagService.getTags()
		availableTags.value = response
	} catch (error) {
		console.error("Error loading tags:", error)
	}
}

const loadIngredients = async () => {
	try {
		const response = await IngredientService.getIngredients()
		availableIngredients.value = response
	} catch (error) {
		console.error("Error loading ingredients:", error)
	}
}

const searchTags = async (query) => {
	if (query.length < 2) return
	try {
		const response = await TagService.searchTags(query)
		availableTags.value = response
	} catch (error) {
		console.error("Error searching tags:", error)
	}
}

const searchIngredients = async (query) => {
	if (query.length < 2) {
		// If search query is too short, show all ingredients
		try {
			const response = await IngredientService.getIngredients()
			availableIngredients.value = response
		} catch (error) {
			console.error("Error loading all ingredients:", error)
		}
		return
	}

	try {
		// First try to use the search endpoint
		const response = await IngredientService.searchIngredients(query)
		availableIngredients.value = response
	} catch (error) {
		console.error("Error searching ingredients:", error)

		// If search endpoint fails (404), fall back to local filtering
		try {
			// Get all ingredients
			const allIngredients = await IngredientService.getIngredients()

			// Filter locally based on the search query
			const lowercaseQuery = query.toLowerCase()
			availableIngredients.value = allIngredients.filter((ingredient) =>
				ingredient.name.toLowerCase().includes(lowercaseQuery)
			)

			console.log(
				"Fallback local search results:",
				availableIngredients.value
			)
		} catch (fallbackError) {
			console.error(
				"Error with fallback ingredient search:",
				fallbackError
			)
		}
	}
}

const addIngredient = () => {
	const newIngredient: Ingredient = {
		id: null,
		quantity: null,
		notes: ""
	}
	newRecipe.value.ingredients.push(newIngredient)
}

const removeIngredient = (index) => {
	newRecipe.value.ingredients.splice(index, 1)
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
		showSnackbar(
			"Please select a valid image file (JPEG, PNG, GIF, or SVG)",
			"error"
		)
		newRecipe.value.image = null
		return
	}

	// Check file size (10MB limit)
	const maxSize = 10 * 1024 * 1024 // 10MB in bytes
	if (file.size > maxSize) {
		showSnackbar("File size must be less than 10MB", "error")
		newRecipe.value.image = null
		return
	}

	newRecipe.value.image = file
}

const editRecipe = (recipe) => {
	isEditing.value = true
	editingRecipeId.value = recipe.id

	// Initialize with existing recipe data
	newRecipe.value = {
		id: recipe.id,
		name: recipe.name,
		description: recipe.description,
		instructions: recipe.instructions,
		prep_time_minutes: recipe.prep_time_minutes || null,
		cook_time_minutes: recipe.cook_time_minutes || null,
		serving_size: recipe.serving_size || null,
		difficulty: recipe.difficulty || null,
		is_vegetarian: recipe.is_vegetarian || false,
		is_vegan: recipe.is_vegan || false,
		is_gluten_free: recipe.is_gluten_free || false,
		is_dairy_free: recipe.is_dairy_free || false,
		is_nut_free: recipe.is_nut_free || false,
		image: null,
		tags: recipe.tags || [],
		ingredients: [],
		nutrition: {
			calories: recipe.nutritionInfo?.calories || null,
			protein: recipe.nutritionInfo?.protein || null,
			carbs: recipe.nutritionInfo?.carbs || null,
			fat: recipe.nutritionInfo?.fat || null,
			fiber: recipe.nutritionInfo?.fiber || null,
			sugar: recipe.nutritionInfo?.sugar || null,
			notes: recipe.nutritionInfo?.notes || ""
		}
	}

	// Format ingredients data for form
	if (recipe.ingredients && recipe.ingredients.length > 0) {
		newRecipe.value.ingredients = recipe.ingredients.map((ing) => ({
			id: ing.id,
			quantity: ing.pivot.quantity,
			notes: ing.pivot.notes
		}))
	}

	showAddRecipeDialog.value = true
}

const confirmDelete = (recipe: any) => {
	// Don't allow deletion if recipe is checked out
	if (recipe.checked_qty > 0) {
		showSnackbar(
			"Cannot delete recipe while it is in use. Please wait until it is marked as done.",
			"warning"
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
		showSnackbar(
			`Recipe "${recipeName}" was deleted successfully!`,
			"success"
		)
	} catch (error) {
		console.error("Error deleting recipe:", error)
		if (error.response) {
			console.error("Error response data:", error.response.data)
			showSnackbar(
				error.response.data.message || "Failed to delete recipe",
				"error"
			)
		} else {
			showSnackbar("Failed to delete recipe. Please try again.", "error")
		}
	}
}

const closeDialog = () => {
	showAddRecipeDialog.value = false
	isEditing.value = false
	editingRecipeId.value = null
	newRecipe.value = {
		id: null,
		name: "",
		description: "",
		instructions: "",
		prep_time_minutes: null,
		cook_time_minutes: null,
		serving_size: null,
		difficulty: "easy",
		is_vegetarian: false,
		is_vegan: false,
		is_gluten_free: false,
		is_dairy_free: false,
		is_nut_free: false,
		image: null,
		tags: [],
		ingredients: [],
		nutrition: {
			calories: null,
			protein: null,
			carbs: null,
			fat: null
		}
	}
}

const submitRecipe = async () => {
	if (!isFormValid.value) return

	formError.value = ""
	isSubmitting.value = true
	try {
		const formData = new FormData()
		formData.append("name", newRecipe.value.name)
		formData.append("description", newRecipe.value.description)

		// Add dietary flags
		formData.append("is_vegan", newRecipe.value.is_vegan ? "1" : "0")
		formData.append(
			"is_vegetarian",
			newRecipe.value.is_vegetarian ? "1" : "0"
		)
		formData.append(
			"is_gluten_free",
			newRecipe.value.is_gluten_free ? "1" : "0"
		)
		formData.append(
			"is_dairy_free",
			newRecipe.value.is_dairy_free ? "1" : "0"
		)
		formData.append("is_nut_free", newRecipe.value.is_nut_free ? "1" : "0")

		// Add cooking details
		if (newRecipe.value.prep_time_minutes) {
			formData.append(
				"prep_time_minutes",
				newRecipe.value.prep_time_minutes
			)
		}
		if (newRecipe.value.cook_time_minutes) {
			formData.append(
				"cook_time_minutes",
				newRecipe.value.cook_time_minutes
			)
		}
		if (newRecipe.value.difficulty) {
			formData.append("difficulty", newRecipe.value.difficulty)
		}

		// Add tags
		if (newRecipe.value.tags && newRecipe.value.tags.length > 0) {
			newRecipe.value.tags.forEach((tag) => {
				formData.append(
					"tags[]",
					typeof tag === "object" ? tag.id : tag
				)
			})
		}

		// Add ingredients
		if (
			newRecipe.value.ingredients &&
			newRecipe.value.ingredients.length > 0
		) {
			newRecipe.value.ingredients.forEach((ingredient, index) => {
				if (ingredient.id) {
					formData.append(`ingredients[${index}][id]`, ingredient.id)
					if (ingredient.quantity) {
						formData.append(
							`ingredients[${index}][quantity]`,
							ingredient.quantity
						)
					}
					if (ingredient.notes) {
						formData.append(
							`ingredients[${index}][notes]`,
							ingredient.notes
						)
					}
				}
			})
		}

		// Add nutrition info
		const nutrition = newRecipe.value.nutrition
		if (nutrition) {
			if (nutrition.calories)
				formData.append("nutrition[calories]", nutrition.calories)
			if (nutrition.protein)
				formData.append("nutrition[protein]", nutrition.protein)
			if (nutrition.carbs)
				formData.append("nutrition[carbs]", nutrition.carbs)
			if (nutrition.fat) formData.append("nutrition[fat]", nutrition.fat)
			if (nutrition.fiber)
				formData.append("nutrition[fiber]", nutrition.fiber)
			if (nutrition.sugar)
				formData.append("nutrition[sugar]", nutrition.sugar)
			if (nutrition.notes)
				formData.append("nutrition[notes]", nutrition.notes)
		}

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

		let response
		if (editingRecipeId.value) {
			// Update existing recipe
			response = await RecipeService.updateRecipe(
				editingRecipeId.value,
				formData
			)
			showSnackbar(
				`Recipe "${newRecipe.value.name}" was updated successfully!`,
				"success"
			)
		} else {
			// Create new recipe
			response = await RecipeService.createRecipe(formData)
			showSnackbar(
				`Recipe "${newRecipe.value.name}" was created successfully!`,
				"success"
			)
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
				// Show detailed error message in the form
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
				formError.value = errorMessage
				showSnackbar(errorMessage, "error")
			} else {
				formError.value = `Error: ${
					error.response.data.message || "Failed to save recipe"
				}`
				showSnackbar(formError.value, "error")
			}
		} else {
			formError.value = "Failed to save recipe. Please try again."
			showSnackbar(formError.value, "error")
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
		showSnackbar(`Recipe "${recipe.name}" saved for cooking!`, "success")
	} catch (error) {
		console.error("Error checking out recipe:", error)
		showSnackbar("Failed to save recipe for cooking", "error")
	}
}

const returnRecipe = async (recipe: any) => {
	try {
		console.log("Returning recipe:", recipe.name)
		const response = await RecipeService.returnRecipe(recipe.id)
		console.log("Return response:", response)
		await loadRecipes() // Refresh the list to show updated status
		showSnackbar(`Recipe "${recipe.name}" marked as done!`, "success")
	} catch (error) {
		console.error("Error returning recipe:", error)
		showSnackbar("Failed to mark recipe as done", "error")
	}
}

const showSnackbar = (text, color = "success", timeout = 5000) => {
	snackbar.value = {
		show: true,
		text,
		color,
		timeout
	}
}

onMounted(() => {
	console.log("Recipe component mounted")
	loadRecipes()
	loadTags()
	loadIngredients()
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
