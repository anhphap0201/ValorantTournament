<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-valDark text-white">
    <Header />
    <main class="pt-16 flex-grow flex flex-col">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

