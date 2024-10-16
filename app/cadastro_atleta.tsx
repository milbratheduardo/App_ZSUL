import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createAluno } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";
import { TextInputMask } from 'react-native-masked-text'; // Importar a biblioteca para a máscara

const CadastroAtleta = () => {
  const { user, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    username: '',
    nascimento: '',
    rg: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'As senhas não coincidem');
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
          <Text className='text-2xl text-black text-semibold mt-10 font-psemibold'>
            Cadastre um novo Atleta
          </Text>

          <FormField 
            title='Nome Completo'
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles='mt-10'
          />

          {/* Campo com máscara para Data de Nascimento */}
          <View className='mt-10'>
            <Text className='text-base text-black-100 font-pmedium'>
              Data de Nascimento
            </Text>
            <TextInputMask
              type={'datetime'}
              options={{
                format: 'DD/MM/YYYY'
              }}
              value={form.nascimento}
              onChangeText={(e) => setForm({ ...form, nascimento: e })}
              className='border-2 border-gray-200 w-full h-16 px-4 bg-gray-100 rounded-2xl text-black font-psemibold text-base'
              placeholder='DD/MM/AAAA'
              placeholderTextColor='#126046'
            />
          </View>

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

          {/* Campo com máscara para telefone */}
          <FormField 
            title='Whatsapp'
            value={form.whatsapp}
            handleChangeText={(e) => setForm({ ...form, whatsapp: e })}
            otherStyles='mt-10'
            maskType={'cel-phone'}
            options={{
              maskType: 'BRL', // Máscara para Brasil
              withDDD: true, // Inclui o DDD
              dddMask: '(99) ' // Define o formato do DDD
            }}
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
            placeholder={'Insira no mínimo 8 caracteres'}
          />
          <FormField 
            title='Confirmar Senha'
            value={form.confirmPassword}
            handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
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
