import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { icons } from '@/constants'

const FormField = ({title, value, placeholder, handleChangeText,
    otherStyles, ...props
}) => {

    const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={`space-y-2 ${otherStyles}`}>
        <Text className='text-base text-black-100 font-pmedium'>
            {title}
        </Text>

        <View className='border-2 border-gray-200 w-full 
        h-16 px-4 bg-gray-100 rounded-2xl 
        focus:border-golden items-center flex-row'>
            <TextInput 
                className='flex-1 text-black font-psemibold text-base'
                value={value}
                placeholder={placeholder}
                placeholderTextColor='#A3935E'
                onChangeText={handleChangeText}
                secureTextEntry={title === 'Senha' && !showPassword}

            />
            {title === 'Senha' && (
                <TouchableOpacity onPress={() => 
                setShowPassword(!showPassword)}>
                    <Image 
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        className='w-6 h-6'
                        resizeMode='contain'
                    />

                </TouchableOpacity>
            )}
        </View>
    </View>
  )
}

export default FormField