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
                items-center min-h-[85vh] px-4'>
                    <Image 
                        source={images.logo_zsul}
                        className= 'w-[175px] h-[80px] mt-2'
                        
                    />

                    <Image 
                        source={images.cards3}
                        className='max-w-[380px] w-full h-[300px]'
                        resizeMode='contain'
                    />

                    <View className='relative mt-5'>
                        <Text className='text-3xl text-black font-bold text-center'>
                        Venha participar da melhor escolinha de futebol de base da Região {' '}
                        <Text className="text-golden">SUL</Text>
                        </Text>
                    </View>

                    <Text className='text-sm font-pregular text-black-100 mt-7 text-center'>
                    Trabalhamos com categorias do Sub-9 ao Sub-17.
                    </Text>

                    <CustomButton 
                        title='Entrar'
                        handlePress= {() => router.push('/signin')}
                        containerStyles='w-full mt-7'
                    />
                </View>

            </ScrollView>

            <StatusBar backgroundColor='#161622' style='light'/>

        </SafeAreaView>
    )
}

