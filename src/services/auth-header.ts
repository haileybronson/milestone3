export default function authHeader(contentType = "") {
	const user = JSON.parse(localStorage.getItem("user") || "{}")

	if (user && user.token) {
		// For file uploads, we need to let the browser set the Content-Type to multipart/form-data
		// with the correct boundary parameter
		if (contentType === "multipart") {
			return {
				Authorization: "Bearer " + user.token
			}
		}
		return {
			Authorization: "Bearer " + user.token,
			Accept: "application/json"
		}
	} else {
		return {}
	}
}
