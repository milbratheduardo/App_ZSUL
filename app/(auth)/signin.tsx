import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import { getCurrentUser, signIn } from '@/lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    email:'',
    password:''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if(form.email === '' || form.password === ''){
      Alert.alert('Error', 'Por favor, preencha todos os campos')
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password)
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      Alert.alert("Success", "Usuário logado com sucesso");
      router.replace('/turmas')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false);
    }
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
              Login ZSUL
            </Text>

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
                    Não possui conta?
                </Text>
                <Link href='/signup' className='text-lg font-psemibold 
                text-golden'>
                  Cadastre-se
                </Link>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn