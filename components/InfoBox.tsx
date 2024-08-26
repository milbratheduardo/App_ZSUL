import { View, Text } from 'react-native'
import React from 'react'

const InfoBox = ({ title, email, containerStyles, titleStyles}) => {
  return (
    <View className={containerStyles}>
        <Text className={`text-golden text-center font-psemibold ${titleStyles}`}>
            {title}
        </Text>
        <Text className={`text-golden text-sm text-center font-pregular`}>
            {email}
        </Text>
    </View>
  )
}

export default InfoBox