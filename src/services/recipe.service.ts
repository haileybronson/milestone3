import axios from "axios"
import API_URL from "./env"
import authHeader from "./auth-header"

class RecipeService {
	getRecipes() {
		const headers = authHeader()
		console.log("API URL:", API_URL)
		console.log("Full request URL:", API_URL + "recipes")
		console.log("Request headers:", headers)

		// Check if we have authorization header
		if (!headers.Authorization) {
			console.error("No authorization header found")
			return Promise.reject(new Error("No authorization token found"))
		}

		// Extract token for debugging
		const token = headers.Authorization.replace("Bearer ", "")
		console.log("Token being used:", token.substring(0, 10) + "...")

		return axios
			.get(API_URL + "recipes", {
				headers,
				validateStatus: function (status) {
					console.log("Response status:", status)
					return status >= 200 && status < 300
				}
			})
			.then((response) => {
				console.log("API Response status:", response.status)
				console.log("API Response headers:", response.headers)
				console.log("API Response data:", response.data)
				return response.data.data
			})
			.catch((error) => {
				console.error("API Error:", error)
				if (error.response) {
					console.error("Error response data:", error.response.data)
					console.error(
						"Error response status:",
						error.response.status
					)
					console.error(
						"Error response headers:",
						error.response.headers
					)
				}
				throw error
			})
	}

	createRecipe(recipe) {
		const formData = new FormData()
		formData.append("name", recipe.name)
		formData.append("description", recipe.description)
		formData.append("image", recipe.image)

		return axios
			.post(API_URL + "recipes", formData, {
				headers: {
					...authHeader(),
					"Content-Type": "multipart/form-data"
				}
			})
			.then((response) => {
				console.log("Create Recipe Response:", response)
				return response.data
			})
			.catch((error) => {
				console.error("Create Recipe Error:", error)
				throw error
			})
	}

	updateRecipe(id: number, recipe: any) {
		const formData = new FormData()
		formData.append("name", recipe.name)
		formData.append("description", recipe.description)
		if (recipe.image) {
			formData.append("image", recipe.image)
		}
		formData.append("_method", "PUT") // Laravel requires this for PUT requests with FormData

		return axios
			.post(API_URL + `recipes/${id}`, formData, {
				headers: {
					...authHeader(),
					"Content-Type": "multipart/form-data"
				}
			})
			.then((response) => {
				console.log("Update Recipe Response:", response)
				return response.data.data
			})
			.catch((error) => {
				console.error("Update Recipe Error:", error)
				throw error
			})
	}

	deleteRecipe(id: number) {
		return axios
			.delete(API_URL + `recipes/${id}`, {
				headers: authHeader()
			})
			.then((response) => {
				console.log("Delete Recipe Response:", response)
				return response.data
			})
			.catch((error) => {
				console.error("Delete Recipe Error:", error)
				throw error
			})
	}

	checkoutRecipe(id: number) {
		return axios
			.post(
				API_URL + `recipes/${id}/checkout`,
				{},
				{
					headers: authHeader()
				}
			)
			.then((response) => {
				console.log("Checkout Recipe Response:", response)
				return response.data.data
			})
			.catch((error) => {
				console.error("Checkout Recipe Error:", error)
				throw error
			})
	}

	returnRecipe(id: number) {
		return axios
			.post(
				API_URL + `recipes/${id}/return`,
				{},
				{
					headers: authHeader()
				}
			)
			.then((response) => {
				console.log("Return Recipe Response:", response)
				return response.data.data
			})
			.catch((error) => {
				console.error("Return Recipe Error:", error)
				throw error
			})
	}
}

export default new RecipeService()
