<script lang="ts">
import { RouterLink, RouterView } from "vue-router"
import LoginView from "./views/login/LoginView.vue"
import { mapState } from "vuex"
import { ref } from "vue"
export default {
	setup() {
		const theme = ref("dark")
		function changeTheme() {
			theme.value = theme.value === "light" ? "dark" : "light"
		}
		return { theme, changeTheme }
	},
	name: "App",
	components: {
		LoginView,
		RouterLink,
		RouterView
	},
	data: function () {
		return {
			profileDialog: false,
			profileIsUploading: false,
			verificationEmailLoading: false,
			showEmailNotVerifiedDialog: false,
			showChangeEmailTextField: false,
			changeEmail: false,
			successVerificationMessage: "",
			changeEmailRules: [
				(value) => !!value || "Required.",
				(value) => (value && value.length >= 3) || "Min 3 characters"
			],
			profile: {
				avatar: "",
				name: "",
				title: "",
				icon: "mdi-account-circle",
				color: "info"
			},
			profilePictureImage: "",
			emailOfVerification: "",
			snackbar: {
				show: false,
				text: "",
				color: "success",
				timeout: 5000
			}
		}
	},

	computed: {
		...mapState({
			user() {
				return this.$store.state.user.user
			},
			auth() {
				return this.$store.state.auth
			},
			authUser() {
				return this.auth.user
			},
			isAuthenticated() {
				return (
					this.auth.status.loggedIn &&
					this.authUser &&
					this.authUser.token
				)
			},
			title() {
				return (
					"Welcome " + (this.authUser ? this.authUser.name : "") + "!"
				)
			},
			avatarURL() {
				return this.auth.user ? this.auth.user.avatar : null
			},
			profilePictureChangeLabel() {
				return "Profile picture change"
			}
		})
	},
	created() {
		const user = JSON.parse(localStorage.getItem("user"))
		if (user && user.token) {
			console.log("User found in localStorage, getting current user")
			this.getCurrentUser()
		}
	},
	methods: {
		showSnackbar(text, color = "success", timeout = 5000) {
			this.snackbar = {
				show: true,
				text,
				color,
				timeout
			}
		},
		onAvatarChange(e) {
			var image = e.target.files || e.dataTransfer.files

			if (!image.length) return
			this.profileIsUploading = true
			this.$store
				.dispatch("user/uploadAvatar", image[0], { root: true })
				.then((response) => {
					this.$store.commit(
						"auth/uploadAvatarSuccess",
						response.avatar
					)
					this.profileIsUploading = false
				})
				.catch((error) => {
					console.log(error)
					this.showSnackbar(
						"Error updating avatar. Please try again.",
						"error"
					)
					this.profileIsUploading = false
				})
		},
		removeAvatar() {
			this.profileIsUploading = true
			this.$store
				.dispatch("user/removeAvatar")
				.then((response) => {
					this.$store.commit(
						"auth/uploadAvatarSuccess",
						response.avatar
					)
					this.profileIsUploading = false
				})
				.catch((error) => {
					console.log(error)
					this.showSnackbar(
						"Error removing avatar. Please try again.",
						"error"
					)
					this.profileIsUploading = false
				})
		},
		getCurrentUser() {
			this.profile.name = this.authUser.name

			this.profile.title = this.title
			this.$store
				.dispatch("user/getUser")
				.then((response) => {
					if (response.avatar) {
						this.$store.commit(
							"auth/uploadAvatarSuccess",
							response.avatar
						)
					}
				})
				.catch((error) => {
					this.logout()
				})
		},
		logout() {
			this.$store.dispatch("auth/logout")
		},
		checkAuth(auth) {
			console.log("Authenticated!", auth)
		}
	}
}
</script>
<template>
	<v-app :theme="theme">
		<v-app-bar v-if="isAuthenticated">
			<v-spacer></v-spacer>
			<v-btn to="/recipes" default class="mr-4"> Recipes </v-btn>
			<v-spacer></v-spacer>

			<v-menu min-width="200px" rounded>
				<template v-slot:activator="{ props }">
					<v-btn icon v-bind="props">
						<v-avatar color="brown" size="large">
							<v-img
								icon
								v-bind="props"
								v-if="avatarURL"
								alt="Avatar"
								:src="avatarURL"
							></v-img>
							<v-icon
								v-bind="props"
								v-else
								:color="profile.color"
								:icon="profile.icon"
							></v-icon>
						</v-avatar>
					</v-btn>
				</template>
				<v-card>
					<v-card-text>
						<div class="mx-auto text-center">
							<h3>{{ profile.name }}</h3>
							<v-divider class="my-3"></v-divider>
							<v-btn
								:prepend-icon="
									theme === 'light'
										? 'mdi-weather-sunny'
										: 'mdi-weather-night'
								"
								@click="changeTheme"
								>Toggle Theme
							</v-btn>
							<v-btn @click="profileDialog = true">
								Profile
							</v-btn>
							<v-divider class="my-3"></v-divider>
							<v-btn @click="logout()">Logout</v-btn>
						</div>
					</v-card-text>
				</v-card>
			</v-menu>
		</v-app-bar>

		<v-main>
			<v-container>
				<div v-if="isAuthenticated">
					<RouterView />
				</div>
				<LoginView
					v-else
					:is-authenticated="isAuthenticated"
					@authenticate="checkAuth($event)"
				/>
			</v-container>
			<v-dialog v-model="profileDialog">
				<v-form>
					<v-card>
						<v-card-title>Profile</v-card-title>
						<v-card-subtitle>
							Enter your profile options here
						</v-card-subtitle>
						<v-card class="mx-auto" max-width="434" rounded="0">
							<v-img
								cover
								v-if="avatarURL"
								:src="avatarURL"
							></v-img>
							<v-icon
								v-else
								:color="profile.color"
								:icon="profile.icon"
							>
							</v-icon>
							<v-file-input
								accept="image/*"
								:loading="profileIsUploading"
								:disabled="profileIsUploading"
								@change="onAvatarChange"
								:label="profilePictureChangeLabel"
							>
							</v-file-input>
						</v-card>
						<v-card-actions>
							<v-btn @click="removeAvatar">
								Remove Profile Picture
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-form>
			</v-dialog>
		</v-main>
		<v-dialog v-model="showEmailNotVerifiedDialog" persistent></v-dialog>

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
	</v-app>
</template>
