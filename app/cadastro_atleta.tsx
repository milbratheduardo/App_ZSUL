import { View, Text, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createAluno } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";
import { TextInputMask } from 'react-native-masked-text'; // Importar a biblioteca para a máscara
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CadastroAtleta = () => {
  const { user, setIsLoggedIn } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorMessage(`Por favor preencha todos os campos. ${error.message}`);
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage(`As senhas não coincidem. ${error.message}`);
      setShowErrorModal(true);
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
      setErrorMessage(`Erro. ${error.message}`);
      setShowErrorModal(true);
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
        <Modal
          visible={showErrorModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: 'red',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              width: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
                Erro
              </Text>
              <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
                {errorMessage}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
};

export default CadastroAtleta;
