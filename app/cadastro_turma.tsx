import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { createTurma } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";

const CadastroTurma = () => {
  const { user, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    title: '',
    Qtd_Semana: '1',
    Dia1: '',
    Dia2: '',
    Dia3: '',
    Local: '',
    MaxAlunos: '',
    Horario_de_inicio: '',
    Horario_de_termino: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (form.title === '' || form.Qtd_Semana === '' || form.Dia1 === '' ||  
      form.Local === '' || form.MaxAlunos === '') {
      Alert.alert('Error', 'Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      await createTurma(
        form.title,
        form.Qtd_Semana,
        form.Dia1,
        form.Dia2,
        form.Dia3,
        form.Local,
        form.MaxAlunos,
        form.Horario_de_inicio,  
        form.Horario_de_termino
      );
      
      router.replace('/turmas');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDias = () => {
    const dias = [];
    if (form.Qtd_Semana >= 1) {
      dias.push(
        <FormField
          key="dia1"
          title="Dia 1"
          value={form.Dia1}
          handleChangeText={(e) => setForm({ ...form, Dia1: e })}
          otherStyles="mt-10"
        />
      );
    }
    if (form.Qtd_Semana >= 2) {
      dias.push(
        <FormField
          key="dia2"
          title="Dia 2"
          value={form.Dia2}
          handleChangeText={(e) => setForm({ ...form, Dia2: e })}
          otherStyles="mt-10"
        />
      );
    }
    if (form.Qtd_Semana >= 3) {
      dias.push(
        <FormField
          key="dia3"
          title="Dia 3"
          value={form.Dia3}
          handleChangeText={(e) => setForm({ ...form, Dia3: e })}
          otherStyles="mt-10"
        />
      );
    }
    return dias;
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
            Cadastre uma Nova Turma
          </Text>

          <FormField 
            title='Nome da Turma'
            value={form.title}
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles='mt-10'
          />
          
          <Text className='mt-10 text-lg text-black'>Quantidade de Vezes na Semana</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10 }}>
            <TouchableOpacity 
              onPress={() => setForm({ ...form, Qtd_Semana: '1' })}
              style={{
                backgroundColor: form.Qtd_Semana === '1' ? '#A3935E' : '#E0E0E0',
                padding: 10,
                borderRadius: 5,
                width: 50,
                alignItems: 'center',
                marginRight: 15
              }}
            >
              <Text style={{ color: 'white' }}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setForm({ ...form, Qtd_Semana: '2' })}
              style={{
                backgroundColor: form.Qtd_Semana === '2' ? '#A3935E' : '#E0E0E0',
                padding: 10,
                borderRadius: 5,
                width: 50,
                alignItems: 'center',
                marginRight: 15
              }}
            >
              <Text style={{ color: 'white' }}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setForm({ ...form, Qtd_Semana: '3' })}
              style={{
                backgroundColor: form.Qtd_Semana === '3' ? '#A3935E' : '#E0E0E0',
                padding: 10,
                borderRadius: 5,
                width: 50,
                alignItems: 'center',
                marginRight: 15
              }}
            >
              <Text style={{ color: 'white' }}>3</Text>
            </TouchableOpacity>
          </View>

          {renderDias()}

          <FormField 
            title='Local'
            value={form.Local}
            handleChangeText={(e) => setForm({ ...form, Local: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Quantidade Máxima de Vagas'
            value={form.MaxAlunos}
            handleChangeText={(e) => setForm({ ...form, MaxAlunos: e })}
            otherStyles='mt-10'
          />
          <FormField 
            title='Horário de Início'
            value={form.Horario_de_inicio}
            handleChangeText={(e) => setForm({ ...form, Horario_de_inicio: e })}
            otherStyles='mt-10'
          />

          <FormField 
            title='Horário de Término'
            value={form.Horario_de_termino}
            handleChangeText={(e) => setForm({ ...form, Horario_de_termino: e })}
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

export default CadastroTurma;
