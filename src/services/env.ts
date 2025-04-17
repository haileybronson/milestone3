// Define API_URL for different environments
let API_URL = "http://3.147.5.1:8888/api/"

// Check if we're in development mode
if (import.meta.env.MODE === "development") {
	console.log("Running in development mode")
	API_URL = "http://127.0.0.1:8000/api/"
}

console.log("Current API_URL:", API_URL)
console.log("Current environment:", import.meta.env.MODE)

export default API_URL
