<template>
  <div class="min-h-screen flex items-center justify-center bg-[#1e57a8] p-4">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-6">
        <v-img src="../assets/new-logo.jpg" alt="Jupita Logo" width="60"></v-img>
        <h1 class="text-2xl font-semibold text-[#1e57a8] mt-2">Jupita</h1>
      </div>

      <!-- Title -->
      <p class="text-center text-gray-600 mb-6 tracking-wide text-sm">SIGN IN TO YOUR ACCOUNT</p>
      <label class="text-sm mb-2 block">Email Address</label>
      <!-- Email Field -->
      <v-text-field
        v-model="email"
        variant="outlined"
        density="comfortable"
        class="mb-4"
        placeholder="youremail@gmail.com"
      />

      <label class=" text-sm mb-2 block">  Password</label>
      <!-- Password Field -->
      <v-text-field
       placeholder="password"
        v-model="password"
        variant="outlined"
        density="comfortable"
        class="mb-2"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
      />

      <!-- Remember + Forgot -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="remember" class="accent-blue-600 w-4 h-4" />
          <label class="text-gray-700 text-sm">Remember me</label>
        </div>
        <button class="text-sm text-blue-600 hover:underline">Forgot Password?</button>
      </div>

      <!-- Sign In Button -->
      <v-btn
      rounded="3xl"
        class="w-full py-3 rounded-full text-white bg-blue"
        @click="submitLogin"
      >
        Sign In
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const submitLogin = () => {
  console.log({ email: email.value, password: password.value, remember: remember.value })
}
</script>

<style scoped></style>
