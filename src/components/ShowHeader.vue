<template>
  <v-row>
        <v-col cols="12" sm="8" md="9">
        <h1
            style="
            font-family: AA-Gothic;
            font-weight: normal;
            font-size: 50px;
            line-height: 45px;
            "
        >
            {{ show.title }}
        </h1>
        </v-col>
        <v-col cols="12" sm="4" md="3" class="text-right">
        <span style="font-size: 25px; line-height: 20px">
            {{ show.createdAt | formatDate }} 10:00-18:00
        </span>
        </v-col>
        
    </v-row>
</template>

<script>
export default {
    props: ["show"]
}
</script>

<style>

</style>