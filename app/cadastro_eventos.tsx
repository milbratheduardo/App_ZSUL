import { View, Text, Image, Alert, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router, useLocalSearchParams } from 'expo-router';
import { createEvent, createMatch, uploadImage } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";

const CadastroEventos = () => {
  const { user } = useGlobalContext();
  const [type, setType] = useState('');
  const [form, setForm] = useState({
    Title: '',
    Date_event: '',
    Description: '',
    Hora_event: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const { selectedAlunosIds, type: typeFromParams, Title, Date_event, Description, Hora_event } = useLocalSearchParams();

  useEffect(() => {
    if (selectedAlunosIds) {
      setSelectedAlunos(selectedAlunosIds.split(','));
    }
    if (typeFromParams) {
      setType(typeFromParams);
    }
  
    // Recuperar os valores do formulário dos parâmetros
    setForm({
      Title: Title || form.Title,
      Date_event: Date_event || form.Date_event,
      Description: Description || form.Description,
      Hora_event: Hora_event || form.Hora_event,
    });
  }, [selectedAlunosIds, typeFromParams, Title, Date_event, Description, Hora_event]);
  
  const pickImage = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Permite selecionar qualquer tipo de arquivo
      });
  
      console.log('Resultado da seleção:', result);
      setSelectedFile(result.assets[0]);
  
      if (!result.canceled) {
        const file = result.assets[0];
        console.log('Informações do arquivo selecionado:', file);
      } else {
        console.log('Seleção cancelada pelo usuário');
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
    }
  };
  
  
  const submitEvent = async () => {
    if (form.Title === '' || form.Date_event === '' || form.Description === '' || form.Hora_event === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos e selecione uma imagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Faz o upload da imagem e obtém o ID da imagem
      const imageId = await uploadImage(selectedFile);

      // Cria o evento com os dados fornecidos e o ID da imagem
      await createEvent(form.Title, form.Date_event, form.Description, form.Hora_event, imageId, type);

      // Redireciona para a página de eventos
      router.replace('/eventos');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitMatch = async () => {
    if (form.Title === '' || form.Date_event === '' || form.Description === '' || form.Hora_event === '' || selectedAlunos.length === 0) {
      Alert.alert('Error', 'Por favor, preencha todos os campos, selecione uma imagem e adicione alunos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageId = await uploadImage(selectedFile);
      await createMatch(form.Title, form.Date_event, form.Description, form.Hora_event, imageId, selectedAlunos, type);
      router.replace('/eventos');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (type === 'evento') {
      submitEvent();
    } else if (type === 'partida') {
      submitMatch();
    } else {
      Alert.alert('Error', 'Por favor, selecione uma opção: Evento ou Partida');
    }
  };

  const renderFormFields = () => (
    <>
      <FormField
        title='Título'
        value={form.Title}
        handleChangeText={(e) => setForm({ ...form, Title: e })}
        otherStyles='mt-10'
      />
      <FormField
        title={`Descrição (Restam ${190 - charCount} caracteres)`}
        value={form.Description}
        handleChangeText={(e) => {
          if (e.length <= 190) {
            setForm({ ...form, Description: e });
            setCharCount(e.length);
          }
        }}
        maxLength={190}
        otherStyles='mt-10'
      />
      <FormField
        title="Data"
        value={form.Date_event}
        handleChangeText={(e) => setForm({ ...form, Date_event: e })}
        maskType="datetime"
        options={{ format: 'DD-MM-YYYY' }}
        otherStyles='mt-10'
      />
      <FormField
        title="Horário"
        value={form.Hora_event}
        handleChangeText={(e) => setForm({ ...form, Hora_event: e })}
        maskType="custom"
        options={{ mask: '99:99' }}
        otherStyles='mt-10'
      />

      <TouchableOpacity className="mt-10">
        <CustomButton
          title="Selecionar Imagem"
          handlePress={pickImage}
          containerStyles='mt-7 px-4'
        />
        {selectedFile ? (
          <Text style={{ color: 'black', marginTop: 10, textAlign: 'center' }}>{selectedFile.name}</Text>
        ) : null}
      </TouchableOpacity>

      {type === 'partida' && (
        <View className="mt-10">
          <CustomButton 
            title="Selecionar Alunos" 
            handlePress={() => router.push({
              pathname: '/selecionar_alunos',
              params: {
                selectedAlunos: selectedAlunos.join(','),
                Title: form.Title,
                Date_event: form.Date_event,
                Description: form.Description,
                Hora_event: form.Hora_event
              }
            })}
          />
          {selectedAlunos.length > 0 && (
            <Text style={{ textAlign: 'center', marginTop: 8 }}>
              {selectedAlunos.length} Aluno(s) Selecionado(s)
            </Text>
          )}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='w-full justify-center px-4 my-6'>
          <Image source={images.logo_zsul} className='w-[115px] h-[35px]' />
          <Text className='text-2xl text-black text-semibold mt-10 font-psemibold'>
            Cadastre um novo Evento ou Partida
          </Text>

          <View className='flex-row justify-between mt-10'>
            <TouchableOpacity
              className={`p-4 w-[45%] ${type === 'evento' ? 'bg-golden' : 'bg-gray-200'} rounded-lg`}
              onPress={() => setType('evento')}
            >
              <Text className={`text-lg text-center ${type === 'evento' ? 'text-white' : 'text-black'}`}>
                Evento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 w-[45%] ${type === 'partida' ? 'bg-golden' : 'bg-gray-200'} rounded-lg`}
              onPress={() => setType('partida')}
            >
              <Text className={`text-lg text-center ${type === 'partida' ? 'text-white' : 'text-black'}`}>
                Partida
              </Text>
            </TouchableOpacity>
          </View>

          {renderFormFields()}
        </View>

        <CustomButton
          title='Cadastrar'
          handlePress={handleSubmit}
          containerStyles='mt-7 mb-10 ml-4 mr-4'
          isLoading={isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CadastroEventos;
