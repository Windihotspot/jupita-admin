<template>
  <div
    class="min-h-screen w-full flex items-center bg-cover bg-center sm:bg-right"
    :style="{ backgroundImage: `url('${bgImage}')` }"
  >
    <!-- LEFT SIDE: LOGIN CARD -->
    <div
  class="flex flex-1 items-center justify-center px-4
         md:translate-x-[-60px]
         lg:translate-x-[-240px]"
>

      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-10">
        <!-- Logo -->
        <div class="flex flex-row items-center mb-8 justify-center">
          <img src="../assets/blue-logo.jpg" alt="Jupita Logo" width="80" />
          <h3 class="text-2xl font-semibold text-[#1e57a8] font-inter">Jupita</h3>
        </div>

        <!-- Title -->
        <p class="text-center text-gray-600 mb-8 text-sm tracking-wide">SIGN IN TO YOUR ACCOUNT</p>

        <!-- Email -->
        <label class="text-sm mb-1 block">Email Address</label>
        <v-text-field
          v-model="email"
          color="primary"
          variant="outlined"
          density="comfortable"
          class="mb-5"
          placeholder="youremail@gmail.com"
        />

        <!-- Password -->
        <label class="text-sm mb-1 block">Password</label>
        <v-text-field
          v-model="password"
          color="primary"
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
          :loading="auth.loading"
          :disabled="auth.loading"
          @click="handleLogin"
        >
          <span v-if="!auth.loading">Sign In</span>
        </v-btn>

        <!-- Error Message -->
        <p v-if="auth.error" class="text-red-600 text-sm text-center mt-4">
          {{ auth.error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import bgImage from '../assets/login-image.png'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    auth.error = 'Email and password are required.'
    return
  }

  const success = await auth.login({
    email: email.value,
    password: password.value
  })
  console.log('login response:', success)

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
