import { View, Text, ScrollView, Alert, TouchableOpacity, Button, Modal, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { createUserProfessor, createUserResponsavel } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '../../constants';

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const [role, setRole] = useState('professor');
  const [form, setForm] = useState({
    username: '',
    cpf: '',
    rg: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    bairro: '',
    whatsapp: '',
    horarios: [] 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const minAge = 7;
  const [maxAge, setMaxAge] = useState(65);
  const [currentDay, setCurrentDay] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date(2024, 1, 1, 15, 0)); 
  const [endTime, setEndTime] = useState(new Date(2024, 1, 1, 17, 0)); 
  const [loadingIconIndex, setLoadingIconIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    let iconInterval;
    if (isSubmitting) {
      iconInterval = setInterval(() => {
        setLoadingIconIndex((prevIndex) => (prevIndex + 1) % loadingIcons.length);
      }, 300);
    }
    return () => clearInterval(iconInterval);
  }, [isSubmitting]);

  const loadingIcons = [
    <FontAwesome name="soccer-ball-o" size={48} color="#126046" />,
    <MaterialCommunityIcons name="tshirt-crew" size={48} color="#126046" />,
    <MaterialCommunityIcons name="soccer-field" size={48} color="#126046" />
  ];

  const handleAgeChange = (value) => {
    setMaxAge(Math.floor(value));
    setForm({ ...form, faixa_etaria: `${minAge}-${Math.floor(value)}` }); // Atualiza faixa etária no formulário
  };

  const handleAddHorario = () => {
    if (currentDay && startTime && endTime) {
      const newHorario = {
        dia: currentDay,
        start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setForm({ ...form, horarios: [...form.horarios, newHorario] });
    }
  };

  const submitProfessor = async () => {
    if (
      form.username === '' || 
      form.cpf === '' || 
      form.email === '' || 
      form.password === '' || 
      form.whatsapp === '' || 
      form.profession === '' || 
      form.modalidades === '' || 
      form.faixa_etaria === ''
    ) {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserProfessor(
        form.email, 
        form.password, 
        form.username, 
        form.cpf, 
        form.whatsapp, 
        form.profession,  
        form.modalidades,  
        form.faixa_etaria,
        form.horarios
      );
      
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/turmas');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResponsavel = async () => {
    if (
      form.username === '' || 
      form.cpf === '' || 
      form.rg === '' || 
      form.email === '' || 
      form.password === '' || 
      form.endereco === '' || 
      form.bairro === '' || 
      form.whatsapp === ''
    ) {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserResponsavel(
        form.email, 
        form.password, 
        form.username, 
        form.cpf, 
        form.endereco, 
        form.bairro, 
        form.rg, 
        form.whatsapp, 
        role
      );

      setUser(result);
      setIsLoggedIn(true);

      router.replace('/turmas');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
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
      setErrorMessage('Por favor, selecione uma opção: Sou Professor ou Sou Responsável');
      setShowErrorModal(true);
    }
  };

  const professions = [
    "Treinador de Futebol", "Preparador Físico", "Fisioterapeuta Esportivo", "Nutricionista Esportivo",
    "Analista de Desempenho", "Psicólogo Esportivo", "Massagista Esportivo", "Coordenador Técnico",
    "Médico Esportivo", "Auxiliar Técnico", "Estagiário", "Preparador de Goleiro"
  ];

  const dias = [
    "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
    "Sexta-feira", "Sábado", "Domingo",
  ];

  const modalidades = [
    "Futebol"
  ];

  const renderFormFields = () => {
    return (
      <>
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Nome Completo</Text>
        <FormField 
          title='Nome Completo'
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
          otherStyles='mt-10'
        />
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">CPF</Text>
        <FormField 
          title='CPF'
          value={form.cpf}
          handleChangeText={(e) => setForm({ ...form, cpf: e })}
          otherStyles='mt-10'
          maskType={'cpf'}
        />
        {role === 'responsavel' && (
          <>
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">RG</Text>
            <FormField 
              title='RG'
              value={form.rg}
              handleChangeText={(e) => setForm({ ...form, rg: e })}
              otherStyles='mt-10'
            />
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Endereço</Text>
            <FormField 
              title='Endereço'
              value={form.endereco}
              handleChangeText={(e) => setForm({ ...form, endereco: e })}
              otherStyles='mt-10'
            />
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Bairro</Text>
            <FormField 
              title='Bairro'
              value={form.bairro}
              handleChangeText={(e) => setForm({ ...form, bairro: e })}
              otherStyles='mt-10'
            />
          </>
        )}
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Modalidade</Text>
        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
          <Picker
            selectedValue={form.modalidades}
            onValueChange={(itemValue, itemIndex) =>
              setForm({ ...form, modalidades: itemValue })
            }
            style={{ height: 50, width: '100%', padding: 10 }}
          >
            <Picker.Item label="Selecione" value="" />
            {modalidades.map((modalidade, index) => (
              <Picker.Item key={index} label={modalidade} value={modalidade} />
            ))}
          </Picker>
        </View>

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Profissão</Text>
        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
          <Picker
            selectedValue={form.profession}
            onValueChange={(itemValue, itemIndex) =>
              setForm({ ...form, profession: itemValue })
            }
            style={{ height: 50, width: '100%', padding: 10 }}
          >
            <Picker.Item label="Selecione" value="" />
            {professions.map((profession, index) => (
              <Picker.Item key={index} label={profession} value={profession} />
            ))}
          </Picker>
        </View>

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Faixa Etária de Trabalho</Text>
        <View style={{ marginBottom: 20 }}>
        <Text>Idade Mínima: {minAge}</Text>
        <Text>Idade Máxima: {maxAge}</Text>
        <Slider
          value={maxAge}
          onValueChange={handleAgeChange}
          minimumValue={minAge}
          maximumValue={65}
          step={1}
          minimumTrackTintColor="#126046"  
          maximumTrackTintColor="#ccc"
          thumbTintColor="#126046"
        />
        </View>
        <Text className='mb-3'>Faixa Etária Selecionada: {form.faixa_etaria}</Text>

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Dias da Semana de Trabalho</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Picker
              selectedValue={currentDay}
              onValueChange={(itemValue) => setCurrentDay(itemValue)}
              style={{ height: 50, width: '100%', padding: 10 }}
            >
              <Picker.Item label="Dia" value="" />
              {dias.map((dia, index) => (
                <Picker.Item key={index} label={dia} value={dia} />
              ))}
            </Picker>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', marginLeft: 30, justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#1E3A8A', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }} // Cor bg-blue-900, flex 1 para ocupar a tela
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setStartTime(selectedDate);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={{ backgroundColor: '#1E3A8A', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 }} // Cor bg-blue-900, flex 1 para ocupar a tela
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setEndTime(selectedDate);
                  }
                }}
              />
            )}
          </View>

        </View>

        <TouchableOpacity
          onPress={handleAddHorario}
          style={{ backgroundColor: '#126046', padding: 10, marginVertical: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Adicionar Horário</Text>
        </TouchableOpacity>

        <View>
          <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Horários Adicionados</Text>
          {form.horarios.length > 0 ? (
            form.horarios.map((horario, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text>{horario.dia}: {horario.start} - {horario.end}</Text>
              </View>
            ))
          ) : (
            <Text className='text-black-700 text-sm font-pregular mb-3 mt-3'>Nenhum horário adicionado</Text>
          )}
        </View>

        <Text className="text-black-700 text-sm font-pbold mb-2">Whatsapp</Text>
        <FormField 
          title='Whatsapp'
          value={form.whatsapp}
          handleChangeText={(e) => setForm({ ...form, whatsapp: e })}
          otherStyles='mt-10'
          maskType={'cel-phone'}
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
        />

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Email</Text>
        <FormField 
          title='Email'
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          otherStyles='mt-10'
          keyboardType='email-address'
        />
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Senha</Text>
        <FormField 
          title='Senha'
          placeholder={'Insira no mínimo 8 caracteres'}
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          otherStyles='mt-10'
        />
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Confirmar Senha</Text>
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
            Cadastre-se
          </Text>
          <Text className='text-sm text-black text-semibold mt-5 font-psemibold'>
            Você é um Profissional?
          </Text>

          <View className='flex-row justify-around mt-5 mb-5'>
            <CustomButton
              title="Sim"
              handlePress={() => setRole('professor')}
              containerStyles={`px-6 py-2 rounded-lg w-[150px] h-[40px] ${role === 'professor' ? 'bg-verde' : 'bg-gray-200'}`}
              textStyles={`text-lg ${role === 'professor' ? 'text-white' : 'text-black'}`}
            />
            
            <CustomButton
              title="Não"
              handlePress={() => setRole('responsavel')}
              containerStyles={`px-6 py-2 rounded-lg w-[150px] h-[40px] ${role === 'responsavel' ? 'bg-verde' : 'bg-gray-200'}`}
              textStyles={`text-lg ${role === 'responsavel' ? 'text-white' : 'text-black'}`}
            />
          </View>

          {renderFormFields()}

          <View className='w-full justify-center items-center mt-5'>
            <CustomButton 
              title='Cadastrar'
              handlePress={handleSubmit}
              containerStyles='px-6 py-2 rounded-lg w-[180px] h-[40px]'
              isLoading={isSubmitting}
            />
          </View>

          <View className="flex-row items-center my-6 w-full">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="px-4 text-gray-500">ou</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <View className= 'flex-row justify-between w-full items-center pt-4 gap-2'>
            <Text className='text-sm text-black-100 font-pregular'>
              Já possui uma conta?
            </Text>              
            <TouchableOpacity
              onPress={() => router.push('/signin')} 
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg w-[150px] h-[40px] ${isSubmitting ? 'bg-blue-700' : 'bg-blue-900'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" /> 
              ) : (
                <Text className="text-white text-center font-pbold">Login</Text> 
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={showErrorModal} // Certifique-se de que `showErrorModal` é `true` quando há erro
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

export default SignUp;
