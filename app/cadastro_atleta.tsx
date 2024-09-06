import { View, Text, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createAluno } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";

const CadastroAtleta = () => {
  const { user, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    username: '',
    nascimento: '',
    rg: '',
    email: '',
    password: '',
    escola: '',
    ano: '',
    whatsapp: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (form.username === '' || form.nascimento === '' || form.rg === '' ||  
      form.escola === '' || form.ano === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAluno(
        form.email,
        form.password,
        form.username,
        form.nascimento,
        form.rg,
        form.escola,
        form.ano,
        form.whatsapp,
        user.username, 
        user.userId     
      );
      
      router.replace('/profile');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
          <Image 
            source={images.logo_zsul}
            className='w-[115px] h-[35px]'
          />
          <Text className='text-2xl text-black text-semibold mt-10 font-psemibold'>
            Cadastre um novo Aluno
          </Text>

          <FormField 
            title='Nome Completo'
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Data de Nascimento'
            value={form.nascimento}
            handleChangeText={(e) => setForm({ ...form, nascimento: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='RG'
            value={form.rg}
            handleChangeText={(e) => setForm({ ...form, rg: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Escola'
            value={form.escola}
            handleChangeText={(e) => setForm({ ...form, escola: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Ano na Escola'
            value={form.ano}
            handleChangeText={(e) => setForm({ ...form, ano: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Whatsapp'
            value={form.whatsapp}
            handleChangeText={(e) => setForm({ ...form, whatsapp: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Email'
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles='mt-10'
            keyboardType='email-address'
          />
          <FormField 
            title='Senha'
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles='mt-10'
            secureTextEntry
          />

          <CustomButton 
            title='Cadastrar'
            handlePress={handleSubmit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CadastroAtleta;
