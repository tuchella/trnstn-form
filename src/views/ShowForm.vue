<template>
  <div class="home">
    <Show :id="$route.params.id" :actId="$route.params.act" />
    
  </div>
</template>

<script>
// @ is an alias to /src
import Show from '../components/Show.vue'

export default {
  name: 'Home',
  components: {
    Show
  },
}
</script>
