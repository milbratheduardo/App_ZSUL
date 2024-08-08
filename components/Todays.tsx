import { View, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import * as Animatable from 'react-native-animatable'
import TurmasCard from './TurmaCard'

const zoomIn = {
  0: {
    scale:0.9
  },
  1: {
    scale: 1
  }
}

const zoomOut = {
  0: {
    scale:1
  },
  1: {
    scale: 0.9
  }
}

const TodaysTurmas = ({ activeItem, item }) => {
  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      <TouchableOpacity 
        className="relative justify-center items-center"
        activeOpacity={0.7}
        onPress={() => console.log('Card pressed!')}
      >
        <TurmasCard 
          turma={{
            title: item.name, 
            Qtd_Semana: item.Qtd_Semana,
            Dia1: item.Dia1,
            Dia2: item.Dia2,
            Dia3: item.Dia3,
            Local: item.Local,
            MaxAlunos: item.MaxAlunos
          }}
        />
      </TouchableOpacity>
    </Animatable.View>
  )
}

const Todays = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]);
  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  console.log(posts)

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TodaysTurmas activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  )
}

export default Todays;
