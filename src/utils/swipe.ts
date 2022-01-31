import { Direction } from '@/types/direction';

const SWIPE_MIN_DISTANCE = 50;

export class SwipeHandler {
  protected startX: number | null = null

  protected startY: number | null = null

  protected whenTouchStart = (event: TouchEvent): void => {
    this.startX = event.changedTouches[0].clientX;
    this.startY = event.changedTouches[0].clientY;
  }

  protected whenTouchEnd = (event: TouchEvent): void => {
    if (this.startX && this.startY) {
      const finishX = event.changedTouches[0].clientX;
      const finishY = event.changedTouches[0].clientY;

      const diffX = finishX - this.startX;
      const diffY = finishY - this.startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > SWIPE_MIN_DISTANCE) {
          if (diffX < 0) {
            this.whenSwipe(Direction.LEFT);
          } else {
            this.whenSwipe(Direction.RIGHT);
          }
        }
      } else if (Math.abs(diffY) > SWIPE_MIN_DISTANCE) {
        if (diffY < 0) {
          this.whenSwipe(Direction.TOP);
        } else {
          this.whenSwipe(Direction.BOTTOM);
        }
      }
    }
  }

  protected whenTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected whenSwipe: (direction: Direction) => void,
  ) {}

  public listen(): void {
    window.addEventListener('touchstart', this.whenTouchStart, { passive: false });
    window.addEventListener('touchmove', this.whenTouchMove, { passive: false });
    window.addEventListener('touchend', this.whenTouchEnd);
  }

  public cancel(): void {
    window.removeEventListener('touchstart', this.whenTouchStart);
    window.removeEventListener('touchmove', this.whenTouchMove);
    window.removeEventListener('touchend', this.whenTouchEnd);
  }
}
