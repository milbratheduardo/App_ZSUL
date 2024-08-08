import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants'
import CustomButton from './CustomButton'

const EmptyState = ({title, subtitle}) => {
  return (
    <View className='justify-center items-center px-4'>
        <Image source={images.empty} className='w-[270px] h-[215px]' 
            resizeMode='contain'/>
        <Text className="text-xl text-center font-psemibold 
            text-primary mt-2">
            {title}
        </Text> 
        <Text className="font-pmedium text-sm text-golden">
            {subtitle}
        </Text>
           
    </View>
  )
}

export default EmptyState