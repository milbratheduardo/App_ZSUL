import { View, Text, ScrollView, TextInput, Alert, StyleSheet, TouchableOpacity, Modal, Platform  } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';
import { useGlobalContext } from "../context/GlobalProvider";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTurma } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';


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
    Sub: '',
    Horario_de_inicio: '',
    Horario_de_termino: ''
  });

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showTerminoPicker, setShowTerminoPicker] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

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
      form.Sub === '' ||
      form.Horario_de_inicio === '' ||
      form.Horario_de_termino === ''
    ) {
      setErrorMessage(`Preencha todos os campos`);
      setShowErrorModal(true);
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
        form.Sub,
        form.Horario_de_inicio,
        form.Horario_de_termino
      );
  
      setSuccessMessage('Turma cadastrada com sucesso!');
      setShowSuccessModal(true);
      setForm({
        title: '',
        Qtd_Semana: '1',
        Dia1: 'Segunda-feira',
        Dia2: '',
        Dia3: '',
        Local: '',
        MaxAlunos: '',
        Sub: '',
        Horario_de_inicio: '',
        Horario_de_termino: ''
      });
    } catch (error) {
      setErrorMessage(`Erro. ${error.message}`);
      setShowErrorModal(true);
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

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>Turma Sub</Text>
          <TextInput
            value={form.Sub}
            onChangeText={(e) => setForm({ ...form, Sub: e })}
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
          <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <MaterialCommunityIcons name="check-circle" size={48} color="white" />
              <Text style={styles.modalTitle}>Sucesso</Text>
              <Text style={styles.modalMessage}>{successMessage}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  
                }}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  campo: {
    marginVertical: 5,
    borderRadius: 100,
    borderWidth: 50,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  alunoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  selectedAlunoItem: {
    backgroundColor: '#e0ffe0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  alunoCheck: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
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
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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

export default CadastroTurma;
