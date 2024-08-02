import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link } from 'expo-router'

const SignUp = () => {
  const [form, setForm] = useState({
    username:'',
    email:'',
    password:''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = () => {

  }
  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
            <Image 
              source={images.logo_zsul}
              className='w-[115px] h-[35px]'
            />
            <Text className='text-2xl text-black text-semibold 
            mt-10 font-psemibold'>
              Registre-se
            </Text>

            <FormField 
              title='Nome Completo'
              value={form.username}
              handleChangeText={(e) => setForm({
                ...form,
                username: e
              })}
              otherStyles='mt-10'
            />

            <FormField 
              title='Email'
              value={form.email}
              handleChangeText={(e) => setForm({
                ...form,
                email: e
              })}
              otherStyles='mt-7'
              keyboardType='email-address'
            />

            <FormField 
              title='Senha'
              value={form.password}
              handleChangeText={(e) => setForm({
                ...form,
                password: e
              })}
              otherStyles='mt-7'
              keyboardType='email-address'
            />

            <CustomButton 
              title='Login'
              handlePress={submit}
              containerStyles='mt-7'
              isLoading={isSubmitting}

            />

            <View className='justify-center pt-5 flex-row gap-2'>
                <Text className='text-lg text-black-100 font-pregular'>
                    Já possui uma conta?
                </Text>
                <Link href='/signin' className='text-lg font-psemibold 
                text-golden'>
                  Login
                </Link>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp