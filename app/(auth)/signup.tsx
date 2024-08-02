import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import {createUser} from '../../lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const [form, setForm] = useState({
    username:'',
    cpf:'',
    email:'',
    password:'',
    endereco:'',
    bairro:''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if(form.username === '' || form.cpf === '' || 
      form.email === '' || form.password === '' || 
      form.endereco === '' || form.bairro === ''){
      Alert.alert('Error', 'Por favor, preencha todos os campos')
    }

    setIsSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, 
        form.username, form.cpf, form.endereco, form.bairro);
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false);
    }
    createUser();
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
              title='CPF'
              value={form.cpf}
              handleChangeText={(e) => setForm({
                ...form,
                cpf: e
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

            <FormField 
              title='Endereço'
              value={form.endereco}
              handleChangeText={(e) => setForm({
                ...form,
                endereco: e
              })}
              otherStyles='mt-7'
            />

            <FormField 
              title='Bairro'
              value={form.bairro}
              handleChangeText={(e) => setForm({
                ...form,
                bairro: e
              })}
              otherStyles='mt-7'
            />

            <CustomButton 
              title='Cadastrar'
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