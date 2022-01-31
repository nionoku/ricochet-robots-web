import { Options, Vue } from 'vue-class-component';
import Game from '@/ui/views/Game.vue';

@Options({
  components: {
    Game,
  },
})
export default class App extends Vue {
  beforeCreate(): void {
    document.title = 'Ricochet Robots';
  }
}
