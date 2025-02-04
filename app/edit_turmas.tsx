import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalContext } from "../context/GlobalProvider";
import { useLocalSearchParams } from 'expo-router';
import { getTurmaById, updateTurma } from '@/lib/appwrite';

const EditTurmas = () => {
  const { turmaId } = useLocalSearchParams();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  useEffect(() => {
    fetchTurma();
  }, [turmaId]);

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setForm({
        title: turmaData.title,
        Qtd_Semana: turmaData.Qtd_Semana.toString(),
        Dia1: turmaData.Dia1,
        Dia2: turmaData.Dia2,
        Dia3: turmaData.Dia3,
        Local: turmaData.Local,
        MaxAlunos: turmaData.MaxAlunos.toString(),
        Horario_de_inicio: turmaData.Horario_de_inicio,
        Horario_de_termino: turmaData.Horario_de_termino
      });
    } catch (error) {
      setErrorMessage('Erro ao buscar dados da turma.');
      setShowErrorModal(true);
    }
  };

  const handleTimeChange = (event, selectedTime, type) => {
    const currentTime = selectedTime || new Date();
    const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    if (type === 'inicio') {
      setForm({ ...form, Horario_de_inicio: formattedTime });
      setShowInicioPicker(false);
    } else if (type === 'termino') {
      setForm({ ...form, Horario_de_termino: formattedTime });
      setShowTerminoPicker(false);
    }
  };

  const handleUpdate = async () => {
    if (
      form.title === '' ||
      form.Qtd_Semana === '' ||
      form.Dia1 === '' ||
      form.Local === '' ||
      form.MaxAlunos === '' ||
      form.Horario_de_inicio === '' ||
      form.Horario_de_termino === ''
    ) {
      setErrorMessage('Preencha todos os campos.');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTurma(turmaId, form);
      setSuccessMessage('Turma atualizada com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(`Erro ao atualizar turma. ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDias = () => {
    const dias = [];
    for (let i = 1; i <= form.Qtd_Semana; i++) {
      dias.push(
        <View key={`dia${i}`} style={{ marginTop: 15 }}>
          <Text style={styles.label}>Dia {i}</Text>
          <Picker
            selectedValue={form[`Dia${i}`]}
            onValueChange={(itemValue) => setForm({ ...form, [`Dia${i}`]: itemValue })}
            style={styles.picker}
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
        <Text style={styles.title}>Editar Turma</Text>

        <Text style={styles.label}>Nome da Turma</Text>
        <TextInput
          value={form.title}
          onChangeText={(e) => setForm({ ...form, title: e })}
          style={styles.input}
          placeholder="Digite o nome da turma"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Quantidade de Vezes na Semana</Text>
        <View style={styles.qtdSemanaContainer}>
          {[1, 2, 3].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setForm({ ...form, Qtd_Semana: `${val}` })}
              style={[
                styles.qtdButton,
                { backgroundColor: form.Qtd_Semana === `${val}` ? '#126046' : '#E0E0E0' }
              ]}
            >
              <Text style={{ color: form.Qtd_Semana === `${val}` ? '#fff' : '#000' }}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderDias()}

        <Text style={styles.label}>Local</Text>
        <TextInput
          value={form.Local}
          onChangeText={(e) => setForm({ ...form, Local: e })}
          style={styles.input}
          placeholder="Digite o local"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Quantidade Máxima de Vagas</Text>
        <TextInput
          value={form.MaxAlunos}
          onChangeText={(e) => setForm({ ...form, MaxAlunos: e })}
          style={styles.input}
          placeholder="Digite o número de vagas"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Horário de Início</Text>
        <TouchableOpacity
          onPress={() => setShowInicioPicker(true)}
          style={styles.timePicker}
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

        <Text style={styles.label}>Horário de Término</Text>
        <TouchableOpacity
          onPress={() => setShowTerminoPicker(true)}
          style={styles.timePicker}
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

        <TouchableOpacity
          onPress={handleUpdate}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Atualizando...' : 'Atualizar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <MaterialCommunityIcons name="check-circle" size={48} color="white" />
            <Text style={styles.modalTitle}>Sucesso</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 15
  },
  picker: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2
  },
  qtdSemanaContainer: { flexDirection: 'row', marginVertical: 10 },
  qtdButton: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50
  },
  timePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 15
  },
  submitButton: {
    backgroundColor: '#126046',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default EditTurmas;
