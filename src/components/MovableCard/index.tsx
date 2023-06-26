/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { useState } from 'react'

import Animated, {
  SharedValue,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'

import { CARD_HEIGHT, Card, CardProps } from '../Card'
import { styles } from './styles'

type Props = {
  data: CardProps
  cardsPosition: SharedValue<number[]>
  scrollY: SharedValue<number>
  cardsCount: number
}

function objectMove(positions: number[], from: number, to: number) {
  'worklet'

  const newPosition = { ...positions }

  for (const id in positions) {
    if (positions[id] === from) {
      newPosition[id] = to
    }

    if (positions[id] === to) {
      newPosition[id] = from
    }
  }

  return newPosition
}

export function MovableCard({ data, cardsPosition, scrollY, cardsCount }: Props) {
  const [moving, setMoving] = useState(false)
  const top = useSharedValue(cardsPosition.value[data.id] * CARD_HEIGHT)

  useAnimatedReaction(
    () => cardsPosition.value[data.id],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition && !moving) {
        top.value = withSpring(currentPosition * CARD_HEIGHT)
      }
    },
    [moving],
  )

  const longPressGesture = Gesture.LongPress().onStart(() => {
    runOnJS(setMoving)(true)
  })

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      moving ? state.activate() : state.fail()
    })
    .onUpdate((event) => {
      'worklet'

      const positionY = event.absoluteY + scrollY.value
      top.value = positionY - CARD_HEIGHT
      const startPositionList = 0
      const endPositionList = cardsCount - 1
      const currentPosition = Math.floor(positionY / CARD_HEIGHT)
      const newPosition = Math.max(
        startPositionList,
        Math.min(currentPosition, endPositionList),
      )

      if (newPosition !== cardsPosition.value[data.id]) {
        // eslint-disable-next-line no-param-reassign
        cardsPosition.value = objectMove(
          cardsPosition.value,
          cardsPosition.value[data.id],
          newPosition,
        )
      }
    })
    .onFinalize(() => {
      const newPosition = cardsPosition.value[data.id] * CARD_HEIGHT
      top.value = withSpring(newPosition)
      runOnJS(setMoving)(false)
    })
    .simultaneousWithExternalGesture(longPressGesture)

  const animatedStyle = useAnimatedStyle(
    () => ({
      top: top.value - CARD_HEIGHT,
      zIndex: moving ? 1 : 0,
      opacity: withSpring(moving ? 1 : 0.4),
    }),
    [moving],
  )

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={Gesture.Race(panGesture, longPressGesture)}>
        <Card data={data} />
      </GestureDetector>
    </Animated.View>
  )
}
