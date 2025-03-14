import userService from "../services/user.service"

const initialState = {
	user: { avatar: "", email: "", email_verified_at: "", name: "" }
}

export const user = {
	namespaced: true,
	state: initialState,
	actions: {
		getUser({ commit }) {
			return userService.getUser().then(
				(user) => {
					commit("setUser", user)
					return Promise.resolve(user)
				},
				(response) => {
					return Promise.resolve(response)
				}
			)
		},
		uploadAvatar({ commit }, image) {
			return userService.uploadAvatar(image).then((response) => {
				return Promise.resolve(response)
			})
		},
		removeAvatar({ commit }) {
			return userService.removeAvatar().then((response) => {
				return Promise.resolve(response)
			})
		}
	},
	mutations: {
		setUser(state, user) {
			state.user = user
		},
		setEmail(state, user) {
			state.user.email = user.email
		}
	},
	getters: {
		getUser: (state) => {
			return state.user
		}
	}
}
