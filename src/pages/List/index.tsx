import { View } from 'react-native'

import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

import { CARDS } from '../../data/cards'
import { MovableCard } from '../../components/MovableCard'
import { Header } from '../../components/Header'
import { styles } from './styles'
import { CARD_HEIGHT } from '../../components/Card'

function listToObject(list: typeof CARDS) {
  return Object.assign({}, ...Object.values(list).map((card, index) => ({ [card.id]: index })))
}

export function List() {
  const scrollY = useSharedValue(0)
  const cardsPosition = useSharedValue(listToObject(CARDS))

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  return (
    <View style={styles.container}>
      <Header />
      <Animated.ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: CARDS.length * CARD_HEIGHT }}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        {CARDS.map((item) => (
          <MovableCard
            key={item.id}
            data={item}
            scrollY={scrollY}
            cardsPosition={cardsPosition}
            cardsCount={CARDS.length}
          />
        ))}
      </Animated.ScrollView>
    </View>
  )
}
