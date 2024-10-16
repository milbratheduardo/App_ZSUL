import React from 'react'
import { ScrollView, View, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../constants'
import CustomButton from '@/components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { Redirect, router } from 'expo-router';

export default function App () {
    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerStyle={{
                height:'100%'
            }}>
                <View className='w-full justify-center 
                items-center min-h-[85vh] px-4 py-1'>
                    <Image 
                        source={images.escola_sp}
                        className= 'w-[112px] h-[150px]'
                    />
                    <Image 
                        source={images.cards3}
                        className='max-w-[320px] w-full h-[300px] -mt-8' // Alterado para mt-1
                        resizeMode='contain'
                    />

                    <View className='relative mt-2'>
                        <Text className='text-3xl text-black font-bold text-center'>
                        Venha participar da melhor escolinha de futebol de base da Região {' '}
                        <Text className="text-vermelho">SUL</Text>
                        </Text>
                    </View>

                    <Text className='text-sm font-pregular text-black-100 mt-5 text-center'>
                    Trabalhamos com categorias do Sub-9 ao Sub-17.
                    </Text>

                    <CustomButton 
                        title='Entrar'
                        handlePress= {() => router.push('/signin')}
                        containerStyles='w-full mt-5'
                    />
                </View>

            </ScrollView>

            <StatusBar backgroundColor='#161622' style='light'/>

        </SafeAreaView>
    )
}
