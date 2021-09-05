import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
          light: {
            primary: colors.grey.darken4, 
            secondary: colors.deepPurple.accent2, 
            accent: colors.blue.accent4, // #3F51B5
          },
        },
      },
});
