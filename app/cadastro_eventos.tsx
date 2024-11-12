import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { images } from '../constants';
import FormField from '@/components/FormField';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { createEvent, createMatch } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";
import { TextInput } from 'react-native';

const CadastroEventos = () => {
  const { user } = useGlobalContext();
  const [type, setType] = useState('evento'); // Definindo 'evento' como valor padrão
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Local: '',
  });
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);


  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  

  const submitForm = async () => {
    if (!form.Title || !date || !form.Description || !time || !form.Local) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (type === 'partida' && selectedAlunos.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione alunos para a partida.');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const formattedDate = formatDate(date);
      const eventData = {
        Title: form.Title,
        Date_event: formattedDate,
        Description: form.Description,
        Hora_event: time.toLocaleTimeString(),
        Confirmados: selectedAlunos,
        type,
      };
      console.log('Dados enviados para createEvent/createMatch:', eventData);
  
      if (type === 'evento') {
        await createEvent(form.Title, formattedDate, form.Description, time.toLocaleTimeString(), type);
      } else if (type === 'partida') {
        await createMatch(form.Title, formattedDate, form.Description, time.toLocaleTimeString(), selectedAlunos, type);
      } else {
        Alert.alert('Erro', 'Selecione uma opção: Evento ou Partida');
        return;
      }
      router.replace('/eventos');
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderFormFields = () => (
    <>
      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Título</Text>
      <FormField
        value={form.Title}
        placeholder="Adicione um título"
        handleChangeText={(e) => setForm({ ...form, Title: e })}
        otherStyles='mt-10'
      />

      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Data</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginTop: 10 }}>
        <FormField
          value={date.toLocaleDateString('pt-BR')}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Horário</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ marginTop: 10 }}>
        <FormField
          value={time ? time.toLocaleTimeString() : "Selecione o horário"}
          editable={false}
        />
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Local</Text>
      <FormField
        value={form.Local}
        placeholder="Endereço Completo"
        handleChangeText={(e) => setForm({ ...form, Local: e })}
        otherStyles='mt-10'
      />

      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Descrição</Text>
      <TextInput
        value={form.Description}
        onChangeText={(e) => {
          if (e.length <= 190) {
            setForm({ ...form, Description: e });
            setCharCount(e.length);
          }
        }}
        maxLength={190}
        multiline={true}
        placeholder="Digite a descrição do evento ou partida"
        style={{
          height: 150,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginTop: 10,
          textAlignVertical: 'top',
        }}
      />
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
        Restam {190 - charCount} caracteres
      </Text>
    </>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='w-full justify-center px-4 my-6'>
          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
              <Text className="text-2xl font-psemibold text-verde">{user?.nome.split(' ')[0]}</Text>
            </View>
            <Image source={images.escola_sp_transparente} className="w-[115px] h-[90px]" />
          </View>

          <View className='flex-row justify-between mt-10'>
            <TouchableOpacity
              className={`p-4 w-[45%] rounded-lg shadow-sm ${type === 'evento' ? 'bg-green-900' : 'bg-gray-300'}`}
              onPress={() => setType('evento')}
            >
              <Text className={`text-lg text-center ${type === 'evento' ? 'text-white' : 'text-black'}`}>
                Evento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-4 w-[45%] rounded-lg shadow-sm ${type === 'partida' ? 'bg-green-900' : 'bg-gray-300'}`}
              onPress={() => setType('partida')}
            >
              <Text className={`text-lg text-center ${type === 'partida' ? 'text-white' : 'text-black'}`}>
                Partida
              </Text>
            </TouchableOpacity>
          </View>

          {renderFormFields()}
        </View>

        <View className="flex-row justify-center mb-10">
          <TouchableOpacity onPress={submitForm} className="mx-4">
            <Icon name="check-circle" size={50} color="#126046" />
          </TouchableOpacity>

          {type === 'partida' && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/selecionar_alunos',
                  params: {
                    selectedAlunos: selectedAlunos.join(','),
                    Title: form.Title,
                    Description: form.Description,
                  },
                })
              }
              className="mx-4"
            >
              <Icon name="group-add" size={50} color="#126046" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CadastroEventos;
