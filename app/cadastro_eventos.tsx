import { View, Text, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { createEvent } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";

const CadastroEventos = () => {
  const { user } = useGlobalContext();
  const [form, setForm] = useState({
    Title: '',
    Date_event: '',
    Description: '',
    Hora_event: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async () => {
    if (form.Title === '' || form.Date_event === '' || form.Description === '' ||  
      form.Hora_event === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      await createEvent(
        form.Title,
        form.Date_event,
        form.Description,
        form.Hora_event
      );
      
      router.replace('/eventos');
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
            Cadastre um novo Evento
          </Text>

          <FormField 
            title='Nome do Evento'
            value={form.Title}
            handleChangeText={(e) => setForm({ ...form, Title: e })}
            otherStyles='mt-10'
          />

          <FormField 
            title={`Descrição do Evento (Restam ${190 - charCount} caracteres)`}
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
            title="Data do Evento"
            value={form.Date_event}
            handleChangeText={(e) => setForm({ ...form, Date_event: e })}
            maskType="datetime"
            options={{ format: 'DD-MM-YYYY' }}
            otherStyles='mt-10'
          />

          <FormField 
            title="Horário do Evento"
            value={form.Hora_event}
            handleChangeText={(e) => setForm({ ...form, Hora_event: e })}
            maskType="custom"
            options={{ mask: '99:99' }} 
            otherStyles='mt-10'
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

export default CadastroEventos;
