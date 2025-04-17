import axios from "axios"
import API_URL from "./env"
import authHeader from "./auth-header"

class RecipeService {
	getRecipes() {
		const headers = authHeader()
		console.log("API URL:", API_URL)
		console.log("Full request URL:", API_URL + "recipes")
		console.log("Request headers:", headers)

		return axios
			.get(API_URL + "recipes", { headers })
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("API Error:", error)
				throw error
			})
	}

	createRecipe(formData: FormData) {
		console.log("Creating recipe with formData:", formData)
		// Log the content of formData
		for (let pair of formData.entries()) {
			console.log(
				pair[0] +
					": " +
					(pair[1] instanceof File ? pair[1].name : pair[1])
			)
		}

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
				if (error.response) {
					console.error(
						"Error response status:",
						error.response.status
					)
					console.error("Error response data:", error.response.data)
					console.error(
						"Validation errors:",
						error.response.data.data
					)
					// If it's a validation error (422), throw the validation messages
					if (error.response.status === 422) {
						throw {
							message: "Validation failed",
							errors: error.response.data.data,
							status: 422
						}
					}
				}
				throw error
			})
	}

	updateRecipe(id: number, formData: FormData) {
		console.log("Updating recipe with formData:", formData)

		// Log the content of formData
		for (let pair of formData.entries()) {
			console.log(
				pair[0] +
					": " +
					(pair[1] instanceof File ? pair[1].name : pair[1])
			)
		}

		// Using POST for updates because the Laravel backend is configured to accept POST for updates
		// This is important! The route uses POST for update operations, not PUT/PATCH
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
				if (error.response) {
					console.error("Error response data:", error.response.data)
				}
				throw error
			})
	}

	deleteRecipe(id: number) {
		return axios
			.delete(API_URL + `recipes/${id}`, {
				headers: authHeader()
			})
			.then((response) => {
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
