import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker'; // Biblioteca para o select
import { TextInputMask } from 'react-native-masked-text'; // Biblioteca para a máscara de horários
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { createTurma } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";

const CadastroTurma = () => {
  const { user, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    title: '',
    Qtd_Semana: '1',
    Dia1: 'Segunda-feira',
    Dia2: '',
    Dia3: '',
    Local: '',
    MaxAlunos: '',
    Horario_de_inicio: '',
    Horario_de_termino: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

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
        <View key="dia1" className="mt-10">
          <Text className="text-base text-black-100 font-pmedium">Dia 1</Text>
          <Picker
            selectedValue={form.Dia1}
            onValueChange={(itemValue) => setForm({ ...form, Dia1: itemValue })}
            style={{ height: 50, backgroundColor: '#f0f0f0', borderRadius: 10 }}
          >
            {dayNames.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>
      );
    }
    if (form.Qtd_Semana >= 2) {
      dias.push(
        <View key="dia2" className="mt-10">
          <Text className="text-base text-black-100 font-pmedium">Dia 2</Text>
          <Picker
            selectedValue={form.Dia2}
            onValueChange={(itemValue) => setForm({ ...form, Dia2: itemValue })}
            style={{ height: 50, backgroundColor: '#f0f0f0', borderRadius: 10 }}
          >
            {dayNames.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>
      );
    }
    if (form.Qtd_Semana >= 3) {
      dias.push(
        <View key="dia3" className="mt-10">
          <Text className="text-base text-black-100 font-pmedium">Dia 3</Text>
          <Picker
            selectedValue={form.Dia3}
            onValueChange={(itemValue) => setForm({ ...form, Dia3: itemValue })}
            style={{ height: 50, backgroundColor: '#f0f0f0', borderRadius: 10 }}
          >
            {dayNames.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>
      );
    }
    return dias;
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
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
                backgroundColor: form.Qtd_Semana === '1' ? '#126046' : '#E0E0E0',
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
                backgroundColor: form.Qtd_Semana === '2' ? '#126046' : '#E0E0E0',
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
                backgroundColor: form.Qtd_Semana === '3' ? '#126046' : '#E0E0E0',
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

          {/* Campo com máscara para Horário de Início */}
          <View className='mt-10'>
            <Text className='text-base text-black-100 font-pmedium'>Horário de Início</Text>
            <TextInputMask
              type={'custom'}
              options={{
                mask: '99:99'
              }}
              value={form.Horario_de_inicio}
              onChangeText={(e) => setForm({ ...form, Horario_de_inicio: e })}
              className='border-2 border-gray-200 w-full h-16 px-4 bg-gray-100 rounded-2xl text-black font-psemibold text-base'
              placeholder='HH:MM'
              placeholderTextColor='#126046'
            />
          </View>

          {/* Campo com máscara para Horário de Término */}
          <View className='mt-10'>
            <Text className='text-base text-black-100 font-pmedium'>Horário de Término</Text>
            <TextInputMask
              type={'custom'}
              options={{
                mask: '99:99'
              }}
              value={form.Horario_de_termino}
              onChangeText={(e) => setForm({ ...form, Horario_de_termino: e })}
              className='border-2 border-gray-200 w-full h-16 px-4 bg-gray-100 rounded-2xl text-black font-psemibold text-base'
              placeholder='HH:MM'
              placeholderTextColor='#126046'
            />
          </View>

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
