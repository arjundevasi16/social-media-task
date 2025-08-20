<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { useAuth } from './stores/useAuth'
</script>

<template>
  <Navbar />
  <main :class="useAuth().isAuthenticated ? 'pt-10' : ''">
    <router-view> </router-view>
  </main>
</template>

<style>
@custom-variant dark (&:where(.dark, .dark *));
</style>
