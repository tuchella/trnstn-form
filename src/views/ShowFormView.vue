<template>
  <div class="home">
    <ShowForm :id="$route.params.id" :actId="$route.params.act" />
    
  </div>
</template>

<script>
// @ is an alias to /src
import ShowForm from '../components/ShowForm.vue'

import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    ShowForm
  }
})
export default class Home extends Vue {

}
</script>
