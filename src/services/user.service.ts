import axios from "axios"
import API_URL from "./env"
import authHeader from "./auth-header"
class UserService {
	getUser() {
		return axios
			.get(API_URL + "user", { headers: authHeader() })
			.then((response) => {
				console.log(response)
				return response.data.data
			})
	}
	uploadAvatar(image) {
		let formData = new FormData()
		formData.append("image", image)
		return axios
			.post(API_URL + "user/upload_avatar", formData, {
				headers: authHeader("multipart")
			})
			.then((response) => {
				return response.data.data
			})
	}
	removeAvatar() {
		return axios
			.delete(API_URL + "user/remove_avatar", { headers: authHeader() })
			.then((response) => {
				return response.data.data
			})
	}
}

const userService = new UserService()
export default userService
