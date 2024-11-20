import { View, Text, ScrollView, TextInput, Alert, TouchableOpacity, Platform  } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';
import { useGlobalContext } from "../context/GlobalProvider";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTurma } from '@/lib/appwrite';


const CadastroTurma = () => {
  const { user } = useGlobalContext();
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

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showTerminoPicker, setShowTerminoPicker] = useState(false);

  const handleTimeChange = (event, selectedTime, type) => {
    const currentTime = selectedTime || new Date();
    const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes()
      .toString()
      .padStart(2, '0')}`;
    if (type === 'inicio') {
      setForm({ ...form, Horario_de_inicio: formattedTime });
      setShowInicioPicker(false);
    } else if (type === 'termino') {
      setForm({ ...form, Horario_de_termino: formattedTime });
      setShowTerminoPicker(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const handleSubmit = async () => {
    if (
      form.title === '' ||
      form.Qtd_Semana === '' ||
      form.Dia1 === '' ||
      form.Local === '' ||
      form.MaxAlunos === '' ||
      form.Horario_de_inicio === '' ||
      form.Horario_de_termino === ''
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
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
  
      Alert.alert('Sucesso', 'Turma cadastrada com sucesso!');
      setForm({
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
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDias = () => {
    const dias = [];
    if (form.Qtd_Semana >= 1) {
      dias.push(
        <View key="dia1" style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Dia 1</Text>
          <Picker
            selectedValue={form.Dia1}
            onValueChange={(itemValue) => setForm({ ...form, Dia1: itemValue })}
            style={{
              height: 50,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              paddingHorizontal: 10,
              elevation: 2
            }}
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
        <View key="dia2" style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Dia 2</Text>
          <Picker
            selectedValue={form.Dia2}
            onValueChange={(itemValue) => setForm({ ...form, Dia2: itemValue })}
            style={{
              height: 50,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              paddingHorizontal: 10,
              elevation: 2
            }}
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
        <View key="dia3" style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Dia 3</Text>
          <Picker
            selectedValue={form.Dia3}
            onValueChange={(itemValue) => setForm({ ...form, Dia3: itemValue })}
            style={{
              height: 50,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              paddingHorizontal: 10,
              elevation: 2
            }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20 }}>
          Cadastre uma Nova Turma
        </Text>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Nome da Turma</Text>
          <TextInput
            value={form.title}
            onChangeText={(e) => setForm({ ...form, title: e })}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}
            placeholder="Digite o nome da turma"
            placeholderTextColor="#aaa"
          />
        </View>

        <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '600' }}>
          Quantidade de Vezes na Semana
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          {[1, 2, 3].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setForm({ ...form, Qtd_Semana: `${val}` })}
              style={{
                backgroundColor: form.Qtd_Semana === `${val}` ? '#126046' : '#E0E0E0',
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
                alignItems: 'center',
                justifyContent: 'center',
                width: 50
              }}
            >
              <Text style={{ color: form.Qtd_Semana === `${val}` ? '#fff' : '#000' }}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderDias()}

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Local</Text>
          <TextInput
            value={form.Local}
            onChangeText={(e) => setForm({ ...form, Local: e })}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}
            placeholder="Digite o local"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Quantidade Máxima de Vagas</Text>
          <TextInput
            value={form.MaxAlunos}
            onChangeText={(e) => setForm({ ...form, MaxAlunos: e })}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}
            placeholder="Digite o número de vagas"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
          />
        </View>

        <View style={{ padding: 0 }}>
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Horário de Início</Text>
        <TouchableOpacity
          onPress={() => setShowInicioPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Text style={{ color: form.Horario_de_inicio ? '#000' : '#aaa' }}>
            {form.Horario_de_inicio || 'Selecione o horário'}
          </Text>
        </TouchableOpacity>
        {showInicioPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'inicio')}
          />
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Horário de Término</Text>
        <TouchableOpacity
          onPress={() => setShowTerminoPicker(true)}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            backgroundColor: '#f9f9f9',
          }}
        >
          <Text style={{ color: form.Horario_de_termino ? '#000' : '#aaa' }}>
            {form.Horario_de_termino || 'Selecione o horário'}
          </Text>
        </TouchableOpacity>
        {showTerminoPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, 'termino')}
          />
        )}
      </View>
    </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            marginTop: 30,
            backgroundColor: '#126046',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CadastroTurma;
