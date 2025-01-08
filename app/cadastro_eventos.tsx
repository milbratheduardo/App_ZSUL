import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { images } from '../constants';
import FormField from '@/components/FormField';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { createEvent, createMatch, getAlunosById } from '../lib/appwrite';
import { useGlobalContext } from "../context/GlobalProvider";
import { TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CadastroEventos = () => {
  const { user } = useGlobalContext();
  const params = useLocalSearchParams();

  const [type, setType] = useState(params.selectedAlunos ? 'partida' : 'evento');
  const [form, setForm] = useState({
    Title: params.Title || '',
    Description: params.Description || '',
    Local: params.Local || '',
  });
  const [date, setDate] = useState(
    params.Date_event
      ? new Date(parseInt(params.Date_event.split('-')[0]), parseInt(params.Date_event.split('-')[1]) - 1, parseInt(params.Date_event.split('-')[2]))
      : new Date()
  );  
  const [time, setTime] = useState(params.Hora_event ? new Date(`1970-01-01T${params.Hora_event}`) : new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(form.Description.length || 0);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (params.selectedAlunos) {
      const alunosIds = params.selectedAlunos.split(',');
      fetchAlunosData(alunosIds);
    }
  }, [params.selectedAlunos]);

  const fetchAlunosData = async (alunosIds) => {
    try {
      const alunosData = await Promise.all(alunosIds.map((id) => getAlunosById(id)));
      setSelectedAlunos(alunosData);
    } catch (error) {
      setErrorMessage(`Não foi possível carregar dados dos alunos. ${error.message}`);
      setShowErrorModal(true);
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; 
  };

  const displayFormattedDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Formato para exibição
  };

  const submitForm = async () => {
    if (!form.Title || !date || !form.Description || !time || !form.Local) {
      setErrorMessage(`Por favor preencha todos os campos.`);
      setShowErrorModal(true);
      return;
    }
    if (type === 'partida' && selectedAlunos.length === 0) {
      setErrorMessage(`Por favor adicione alunos a partida.`);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = displayFormattedDate(date);
      const eventData = {
        Title: form.Title,
        Date_event: formattedDate,
        Description: form.Description,
        Hora_event: time.toLocaleTimeString(),
        Confirmados: selectedAlunos.map(aluno => aluno.userId),
        type,
        Local: form.Local
      };
    

      if (type === 'evento') {
        await createEvent(form.Title, formattedDate, form.Description, time.toLocaleTimeString(), type, form.Local);
      } else if (type === 'partida') {
        await createMatch(form.Title, formattedDate, form.Description, time.toLocaleTimeString(), selectedAlunos.map(aluno => aluno.userId), type, form.Local);
      } else {
        setErrorMessage(`Selecione uma opção: partida ou evento. ${error.message}`);
        setShowErrorModal(true);
        return;
      }
      router.replace('/eventos');
    } catch (error) {
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
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
          value={displayFormattedDate(date)}
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


  
  const renderSelectedAlunos = () => (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Alunos Selecionados:</Text>
      {selectedAlunos.length === 0 ? (
        <Text>Nenhum aluno selecionado</Text>
      ) : (
        <FlatList
          data={selectedAlunos}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text>{item.nome}</Text>
            </View>
          )}
        />
      )}
    </View>
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
          {type === 'partida' && renderSelectedAlunos()}
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
                    selectedAlunos: selectedAlunos.map(aluno => aluno.userId).join(','),
                    Title: form.Title,
                    Description: form.Description,
                    Local: form.Local,
                    Date_event: formatDate(date), // Enviando data em formato ISO
                    Hora_event: time.toLocaleTimeString(),
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

export default CadastroEventos;
