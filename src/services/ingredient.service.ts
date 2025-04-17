import axios from "axios"
import API_URL from "./env"
import authHeader from "./auth-header"

class IngredientService {
	getIngredients() {
		return axios
			.get(API_URL + "ingredients", {
				headers: authHeader()
			})
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Get Ingredients Error:", error)
				throw error
			})
	}

	searchIngredients(query: string) {
		return axios
			.get(
				API_URL + `ingredients/search?q=${encodeURIComponent(query)}`,
				{
					headers: authHeader()
				}
			)
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Search Ingredients Error:", error)
				throw error
			})
	}

	createIngredient(data: { name: string; unit: string }) {
		return axios
			.post(API_URL + "ingredients", data, {
				headers: authHeader()
			})
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Create Ingredient Error:", error)
				throw error
			})
	}
}

export default new IngredientService()
