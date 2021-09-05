<template>
  <v-alert
  color="blue"
  outlined
  type="info">
  <div :class="'form-info' + (hidden ? ' hidden' : '')">
    <div class="form-info__text">
      <p v-html="text"></p>
    </div>
    <a @click="hidden = true" class="blue--text form-info__less-link" href="#"
      >show less</a
    >
    <a @click="hidden = false" class="blue--text form-info__more-link" href="#"
      >show more</a
    >
  </div>
  </v-alert>
</template>

<script>
export default {
  props: ["value"],
  data: () => ({
    hidden: false,
  }),
  computed: {
    text() {
      return this.value
        .replaceAll("<", "&;lt")
        .replaceAll(">", "&;gt")
        .replaceAll("\n", "<br>");
    },
  },
};
</script>

<style>
.form-info {
}
.form-info h2 {
  margin-bottom: 1em;
  transition: margin-bottom 0.1s;
}
.form-info.hidden h2 {
  margin-bottom: 0;
}

.form-info__more-link,
.form-info__less-link {
  width: 100%;
  display: inline-block;
  text-align: center;
}

.form-info .form-info__text {
  text-align: justify;
  overflow: hidden;
  max-height: 999px;
  transition: max-height 0.1s;
}
.form-info.hidden .form-info__text {
  max-height: 0px;
}
.form-info.hidden .form-info__less-link {
  display: none;
}
.form-info .form-info__less-link {
  display: inline-block;
}
.form-info.hidden .form-info__more-link {
  display: inline-block;
}
.form-info .form-info__more-link {
  display: none;
}
</style>