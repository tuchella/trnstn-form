<template>
  <div class="home">
    <v-btn @click="navigate">GO</v-btn>
  </div>
</template>

<script>

export default {
  name: 'Home',
  methods: {
      navigate() {
          this.$router.push({ name: "ThankYou", params: { id: "HELL24240" } });
      }
  }
}
</script>
