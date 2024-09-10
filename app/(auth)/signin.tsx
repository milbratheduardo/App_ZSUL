import { View, Text, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images, icons } from '../../constants'; // Certifique-se de ter o ícone de sucesso.
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn } from '@/lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Verifica se há uma sessão ativa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsLoggedIn(true);
          router.replace('/turmas');
        }
      } catch (error) {
        console.log('Nenhuma sessão ativa encontrada', error.message);
      }
    };
    checkSession();
  }, []);

  const submit = async () => {
    if (form.email === '' || form.password === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
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
            <Link href='/signup' className='text-lg font-psemibold text-golden'>
              Cadastre-se
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Sucesso */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 15 }}>
              Tudo certo!
            </Text>
            <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 20 }}>
              Usuário Logado com Sucesso!
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#A3935E',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 5,
              }}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/turmas'); // Redireciona para a próxima página
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignIn;
