<template>
  <div
    class="min-h-screen w-full flex items-center bg-cover bg-center"
    :style="{
      backgroundImage: `url('${bgImage}')`
    }"
  >
    <!-- LEFT SIDE: LOGIN CARD -->
    <div class="flex flex-1 items-center justify-start pl-[120px] pr-4">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-10">
        <!-- Logo -->
        <div class="flex flex-row items-center mb-8 justify-center">
          <img src="../assets/blue-logo.jpg" alt="Jupita Logo" width="80" class="" />
          <h3 class="text-2xl font-semibold text-[#1e57a8] font-inter">Jupita</h3>
        </div>

        <!-- Title -->
        <p class="text-center text-gray-600 mb-8 text-sm tracking-wide">SIGN IN TO YOUR ACCOUNT</p>

        <!-- Email -->
        <label class="text-sm mb-1 block">Email Address</label>
        <v-text-field
          color="primary"
          v-model="email"
          variant="outlined"
          density="comfortable"
          class="mb-5"
          placeholder="youremail@gmail.com"
        />

        <!-- Password -->
        <label class="text-sm mb-1 block">Password</label>
        <v-text-field
          color="primary"
          v-model="password"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :type="showPassword ? 'text' : 'password'"
          placeholder="********"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="remember" class="accent-blue-600 w-4 h-4" />
            <label class="text-gray-700 text-sm">Remember me</label>
          </div>

          <button class="text-sm text-blue-600 hover:underline">Forgot Password?</button>
        </div>

        <!-- Sign In Button -->
        <v-btn
          rounded="xl"
          class="w-full py-3 rounded-full text-white"
          color="#1e57a8"
          to="/dashboard"
        >
          Sign In
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import bgImage from '../assets/login-image.png' // <-- Use your globe background image

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const submitLogin = () => {
  console.log({
    email: email.value,
    password: password.value,
    remember: remember.value
  })
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
