import axios from "axios"
import API_URL from "./env"
import authHeader from "./auth-header"

class TagService {
	getTags() {
		return axios
			.get(API_URL + "tags", {
				headers: authHeader()
			})
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Get Tags Error:", error)
				throw error
			})
	}

	searchTags(query: string) {
		return axios
			.get(API_URL + `tags/search?q=${encodeURIComponent(query)}`, {
				headers: authHeader()
			})
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Search Tags Error:", error)
				throw error
			})
	}

	createTag(name: string) {
		return axios
			.post(
				API_URL + "tags",
				{ name },
				{
					headers: authHeader()
				}
			)
			.then((response) => {
				return response.data.data
			})
			.catch((error) => {
				console.error("Create Tag Error:", error)
				throw error
			})
	}
}

export default new TagService()
