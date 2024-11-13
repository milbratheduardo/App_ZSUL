import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import React, { useState, useEffect } from 'react';
import TurmaCard2 from '@/components/TurmaCard2';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { getTurmaById, salvarNotifica } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const Notifica = () => {
  const { turmaId } = useLocalSearchParams();
  const [form, setForm] = useState({
    data: new Date(),
    hora: new Date(),
    local: '',
    observacoes: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [turma, setTurma] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Responsáveis');
  const { user, selectedImages, setSelectedImages } = useGlobalContext();
  const [loading, setLoading] = useState(true);

  const handleSaveRelatorio = async () => {
    try {
      const relatorioData = {
        userId: user.userId,
        turmaId,
        data: form.data.toLocaleDateString('pt-BR'),
        hora: form.hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observacoes: form.observacoes,
        publico: selectedOption,
      };

      await salvarNotifica(relatorioData);
      Alert.alert('Sucesso', 'Mensagem Enviada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o relatório.');
      console.error('Erro ao salvar relatório:', error);
    }
  };

  useEffect(() => {
    const fetchTurma = async () => {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
      setLoading(false);
    };

    fetchTurma();
  }, [turmaId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Notificação</Text>

        <View style={[styles.cardContainer, { marginTop: 30 }]}>
          {loading ? (
            <ActivityIndicator size="large" color="#006400" />
          ) : turma ? (
            <TurmaCard2 turma={turma} />
          ) : (
            <Text>Carregando dados da turma...</Text>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedOption === 'Responsáveis' && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOption('Responsáveis')}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === 'Responsáveis' && styles.selectedOptionText,
              ]}
            >
              Responsáveis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedOption === 'Atletas' && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOption('Atletas')}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === 'Atletas' && styles.selectedOptionText,
              ]}
            >
              Alunos
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
          <Text style={styles.input}>{form.data.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.data}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setForm({ ...form, data: selectedDate });
            }}
          />
        )}

        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputContainer}>
          <Text style={styles.input}>
            {form.hora
              ? form.hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Selecione a hora'}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={form.hora || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setForm({ ...form, hora: selectedTime });
            }}
          />
        )}

        <Text style={styles.label}>Observações</Text>
        <TextInput
          placeholder="Digite as observações"
          value={form.observacoes}
          onChangeText={(text) => setForm({ ...form, observacoes: text })}
          style={styles.textInput}
          multiline
        />

        {selectedImages.length > 0 && (
          <View style={styles.fileContainer}>
            <Text style={styles.fileLabel}>Imagens Selecionadas:</Text>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageThumbnail}>
                <Text style={styles.fileText}>{image.title || image.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRelatorio}>
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 30,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  cardContainer: {
    marginTop: 20,
    width: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#006400',
  },
  optionText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedOptionText: {
    color: '#fff',
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginVertical: 8,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    textAlignVertical: 'top',
    height: 100,
  },
  fileContainer: {
    marginTop: 10,
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  imageThumbnail: {
    padding: 10,
    backgroundColor: '#d9d9d9',
    borderRadius: 8,
    marginBottom: 5,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#006400',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Notifica;
