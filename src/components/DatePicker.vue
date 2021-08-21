<template>
  <div>
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          :value="dateStr"
          label="Date"
          append-icon="mdi-calendar"
          readonly
          v-bind="attrs"
          v-on="on"
          @input="updateValue($event)"
        ></v-text-field>
      </template>
      <v-date-picker
        :value="dateStr"
        :active-picker.sync="activePicker"
        :min="dateWithYearOffset(-1)"
        :max="dateWithYearOffset(4)"
        @change="save"
        @input="updateValue($event)"
      ></v-date-picker>
    </v-menu>
  </div>
</template>

<script>
import { dateWithYearOffset, dateToString, stringToDate } from "../util/date"

export default {
    props: ["value"],
    data: () => ({
      activePicker: null,
      menu: false,
    }),
    watch: {
      menu (val) {
        val && setTimeout(() => (this.activePicker = 'YEAR'))
      },
    },
    computed: {
      dateStr() {
        return dateToString(this.value);
      }
    },
    methods: {
      updateValue: function (e) {
        const s = typeof e == 'string' ? e : e.target.value;
        this.$emit('input', stringToDate(s));
      },
      save (date) {
        this.$refs.menu.save(date)
      },
      dateWithYearOffset
    },
  }
</script>

<style>

</style>