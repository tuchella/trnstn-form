<template>
  <v-row>
    <v-col cols="12" sm="8" class="d-none d-sm-block" 
        @dragover="dragover"
        @drop="drop">
      <v-file-input
        ref="upload"
        v-model="file"
      
        outlined
        label="audio file"
        prepend-icon=""
        prepend-inner-icon="mdi-file"
        hide-details="true"
      >
      </v-file-input>
    </v-col>
    <v-col cols="12" sm="4" >
      <v-btn class="upload-btn" block outlined @click="uploadClick">{{ file && $vuetify.breakpoint.xsOnly ? file.name : "choose file" }}</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
    props: ["value"],
    data: () => ({
        file: null
    }),
    mounted() {
        this.file = this.value;
    },
    watch: {
        "file": function (val) {
            this.$emit('input', val);
        }
    },
    methods: {
      uploadClick: function (e) {
        e.preventDefault();
        this.$refs.upload.$refs.input.click();
      },
      dragover(e) {
        e.preventDefault();
      },
      drop: function (event) {
        event.preventDefault();
        this.file = event.dataTransfer.files[0];
      },
    },
};
</script>

<style>
.upload-btn {
  min-height: 56px;
}
</style>