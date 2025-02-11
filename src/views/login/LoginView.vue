<template>
	<button v-if="!isAuthenticated" @click="submitLogin()">LOGIN</button>
</template>
<script src="./LoginView.ts" />

<style src="./LoginView.scss" />
