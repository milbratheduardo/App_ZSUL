import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image, TextInput } from 'react-native'; 
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link } from 'expo-router';
import { getCurrentUser, signIn } from '@/lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; // Adicionar ícones da biblioteca
import { images } from '../../constants'; // Certifique-se de que o caminho das imagens está correto
import emailjs from 'emailjs-com';


const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIconIndex, setLoadingIconIndex] = useState(0); // Para trocar os ícones
  const [hasError, setHasError] = useState(false); // Para controlar erros
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  const [showErrorModal, setShowErrorModal] = useState(false); // Exibir modal de erro
  const [showChoiceModal, setShowChoiceModal] = useState(false); // Exibir modal de escolha
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const loadingIcons = [
    <FontAwesome name="soccer-ball-o" size={48} color="#126046" />, 
    <MaterialCommunityIcons name="tshirt-crew" size={48} color="#126046" />, 
    <MaterialCommunityIcons name="soccer-field" size={48} color="#126046" />
  ];

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
        // Handle error silently
      }
    };
    checkSession();
  }, []);

  const modal_escolha = async () => {
    setErrorMessage('Por favor, preencha todos os campos');
    setShowChoiceModal(true);
  };

  useEffect(() => {
    let iconInterval;
    if (isSubmitting) {
      iconInterval = setInterval(() => {
        setLoadingIconIndex((prevIndex) => (prevIndex + 1) % loadingIcons.length);
      }, 300);
    }
    return () => clearInterval(iconInterval);
  }, [isSubmitting]);

  const submit = async () => {
    if (form.email === '' || form.password === '') {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);
      setTimeout(() => {
        setIsSubmitting(false);
        router.replace('/turmas');
      }, 3000);
    } catch (error) {
      setHasError(true);
      if (error.message.includes('Invalid credentials')) {
        setErrorMessage('Email e/ou senha incorretos');
      } else if (error.message.includes('Password must be')) {
        setErrorMessage('Senha tem que conter no mínimo 8 caracteres');
      } else {
        setErrorMessage(error.message);
      }
      setShowErrorModal(true);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  };

  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      setErrorMessage('Por favor, insira um email válido');
      setShowErrorModal(true);
      return;
    }

    const templateParams = {
      email: recoveryEmail,
      assunto: 'Recuperação de Senha',
      descricao: 'Solicitação para redefinição de senha.'
    };

    try {
      await emailjs.send('service_gciw5lm', 'template_le4ktiu', templateParams, 'ypSN4onrJ_W04LRlr');
      setEmailSent(true);
      setTimeout(() => {
        setForgotPasswordModalVisible(false);
        setEmailSent(false);
      }, 3000);
    } catch (error) {
      setErrorMessage('Erro ao enviar email. Tente novamente.');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      {isSubmitting ? (
        <View className="flex-1 justify-center items-center">
          <Image 
            source={images.escola_sp}
            className="w-[150px] h-[150px] mb-6"
            resizeMode="contain"
          />
          <Text className="text-xl font-semibold mb-4">Carregando...</Text>
          <View>{loadingIcons[loadingIconIndex]}</View>
        </View>
      ) : (
        <ScrollView>
          <View className="w-full justify-center min-h-[85vh] px-4 my-6">
            <View className="items-center">
              <Image 
                source={images.escola_sp}
                className="w-[150px] h-[150px] mb-6"
                resizeMode="contain"
              />
              <Text className="text-2xl font-pbold mb-8">S.C São Paulo</Text>
            </View>
            <FormField
              title="Email"
              placeholder="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-7"
              keyboardType="email-address"
            />

            <FormField
              title="Senha"
              placeholder="Senha"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-7"
            />

            <View className="flex-row justify-between w-full pt-4 gap-2">
              <TouchableOpacity onPress={() => setForgotPasswordModalVisible(true)}>
                <Text className="text-sm text-black-100 font-pregular">Esqueceu a senha?</Text>
              </TouchableOpacity>
              <CustomButton
                title="Entrar"
                handlePress={submit}
                containerStyles="px-6 py-2 rounded-lg w-[150px] h-[40px]"
                isLoading={isSubmitting}
              />
            </View>

            <View className="flex-row items-center my-6 w-full">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="px-4 text-gray-500">ou</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            <View className="flex-row justify-between w-full items-center pt-4 gap-2">
              <Text className="text-sm text-black-100 font-pregular">Não possui conta?</Text>
              <TouchableOpacity
                onPress={() => modal_escolha()}
                disabled={isSubmitting}
                className={`px-6 py-1 rounded-lg w-[150px] h-[40px] ${isSubmitting ? 'bg-blue-700' : 'bg-blue-900'}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center mt-2 font-pbold">Cadastre-se</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

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
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Erro</Text>
            <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>{errorMessage}</Text>
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

      <Modal
        visible={forgotPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setForgotPasswordModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            width: '90%',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Recuperar Senha</Text>
            {emailSent ? (
              <Text style={{ color: 'green', marginBottom: 20 }}>Email enviado com sucesso!</Text>
            ) : (
              <>
                <TextInput
                  style={{
                    width: '100%',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 20,
                    backgroundColor: '#F9FAFB',
                  }}
                  placeholder="Digite seu email"
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#CCCCCC',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                    }}
                    onPress={() => setForgotPasswordModalVisible(false)}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#126046',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                    }}
                    onPress={handleForgotPassword}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showChoiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
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
            <Text style={{ color: 'black', fontSize: 22, fontWeight: 'bold', marginVertical: 15 }}>Escolha uma opção</Text>

            <TouchableOpacity
              onPress={() => {
                setShowChoiceModal(false);
                router.push({ pathname: '/signup', params: { role: 'professor' } });
              }}
              style={{
                backgroundColor: '#5f1c1c',
                paddingVertical: 15,
                paddingHorizontal: 30,
                borderRadius: 10,
                marginBottom: 15,
                width: '80%',
                alignItems: 'center',
                flexDirection: 'row'
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="whistle" size={30} color="white" style={{ marginRight: 20 }} />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Treinador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowChoiceModal(false);
                router.push({ pathname: '/signup', params: { role: 'responsavel' } });
              }}
              style={{
                backgroundColor: '#FFA500',
                paddingVertical: 15,
                paddingHorizontal: 30,
                borderRadius: 10,
                marginBottom: 15,
                width: '80%',
                alignItems: 'center',
                flexDirection: 'row'
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="account-child" size={30} color="white" style={{ marginRight: 20 }} />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Responsável</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignIn;
