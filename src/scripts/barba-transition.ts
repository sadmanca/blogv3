import barba from '@barba/core'
import { animate } from 'animejs'
import type { ITransitionData } from '@barba/core'

barba.init({
  transitions: [
    {
      name: 'default-transition',
      leave(data: ITransitionData) {
        return animate(data.current.container, {
          opacity: [1, 0],
          translateY: [0, -15],
          duration: 300,
          ease: 'inOutQuad',
        })
      },
      enter(data: ITransitionData) {
        return animate(data.next.container, {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 300,
          ease: 'inOutQuad',
        })
      },
    },
  ],
  views: [
    {
      namespace: 'page',
      afterEnter() {
        window.dispatchEvent(new CustomEvent('barba:after'))
      },
    },
  ],
  preventRunning: true,
})
