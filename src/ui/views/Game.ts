import { Options, Vue } from 'vue-class-component';
import Scene from '@/ui/components/Scene.vue';

@Options({
  components: {
    Scene,
  },
})
export default class Game extends Vue {}
