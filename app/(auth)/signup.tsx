import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createUserProfessor, createUserResponsavel } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    username: '',
    cpf: '',
    rg: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    bairro: '',
    whatsapp: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitProfessor = async () => {
    if (form.username === '' || form.cpf === '' || 
      form.email === '' || form.password === '' || 
      form.whatsapp === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserProfessor(form.email, form.password, 
        form.username, form.cpf, form.whatsapp, role);
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/turmas');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResponsavel = async () => {
    if (form.username === '' || form.cpf === '' || form.rg === '' || 
      form.email === '' || form.password === '' || 
      form.endereco === '' || form.bairro === '' || form.whatsapp === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserResponsavel(form.email, form.password, 
        form.username, form.cpf, form.endereco, form.bairro, form.rg, 
        form.whatsapp, role);
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/turmas');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (role === 'professor') {
      submitProfessor();
    } else if (role === 'responsavel') {
      submitResponsavel();
    } else {
      Alert.alert('Error', 'Por favor, selecione uma opção: Sou Professor ou Sou Responsável');
    }
  };

  const renderFormFields = () => {
    return (
      <>
        <FormField 
          title='Nome Completo'
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
          otherStyles='mt-10'
        />
        <FormField 
          title='CPF'
          value={form.cpf}
          handleChangeText={(e) => setForm({ ...form, cpf: e })}
          otherStyles='mt-10'
          maskType={'cpf'}
        />
        {role === 'responsavel' && (
          <>
            <FormField 
              title='RG'
              value={form.rg}
              handleChangeText={(e) => setForm({ ...form, rg: e })}
              otherStyles='mt-10'
            />
            <FormField 
              title='Endereço'
              value={form.endereco}
              handleChangeText={(e) => setForm({ ...form, endereco: e })}
              otherStyles='mt-10'
            />
            <FormField 
              title='Bairro'
              value={form.bairro}
              handleChangeText={(e) => setForm({ ...form, bairro: e })}
              otherStyles='mt-10'
            />
          </>
        )}
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
          placeholder={'Insira no mínimo 8 caracteres'}
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          otherStyles='mt-10'
        />
        <FormField 
          title='Confirmar Senha'
          value={form.confirmPassword}
          handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
          otherStyles='mt-10'
          secureTextEntry
        />
      </>
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
          <Text className='text-2xl text-black text-semibold font-psemibold'>
            Registre-se
          </Text>
          <Text className='text-sm text-black text-semibold mt-5 font-psemibold'>
            Selecione uma das opções abaixo:
          </Text>

          <View className='flex-row justify-around mt-10'>
            <TouchableOpacity 
              className={`p-4 ${role === 'professor' ? 'bg-verde' : 'bg-gray-200'}`}
              onPress={() => setRole('professor')}
            >
              <Text className={`text-lg ${role === 'professor' ? 'text-white' : 'text-black'}`}>
                Sou Professor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`p-4 ${role === 'responsavel' ? 'bg-verde' : 'bg-gray-200'}`}
              onPress={() => setRole('responsavel')}
            >
              <Text className={`text-lg ${role === 'responsavel' ? 'text-white' : 'text-black'}`}>
                Sou Responsável
              </Text>
            </TouchableOpacity>
          </View>

          {renderFormFields()}

          <CustomButton 
            title='Cadastrar'
            handlePress={handleSubmit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-black-100 font-pregular'>
              Já possui uma conta?
            </Text>
            <Link href='/signin' className='text-lg font-psemibold text-verde'>
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
