import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native'; 
import React, { useState, useEffect } from 'react';
import TurmaCard2 from '@/components/TurmaCard2';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { getTurmaById, salvarRelatorio, getMetodologias } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const Relatorios = () => {
  const { turmaId, turmaTitle } = useLocalSearchParams();
  const [form, setForm] = useState({ data: new Date(), hora: new Date(), local: '' });
  const [metodologias, setMetodologias] = useState([]);
  const [selectedMetodologias, setSelectedMetodologias] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [turma, setTurma] = useState(null);
  const { user, selectedImages, setSelectedImages } = useGlobalContext();
  const [loading, setLoading] = useState(true);

  const handleUploadImages = async () => {
    router.push('/enviar_fotoTreino');
  };

  const handleSaveRelatorio = async () => {
    try {
      const relatorioData = {
        userId: user.userId,
        turmaId,
        data: form.data.toLocaleDateString('pt-BR'),
        hora: form.hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        local: form.local,
        metodologias: selectedMetodologias,
        imagens: selectedImages,
      };

      const response = await salvarRelatorio(relatorioData);
      Alert.alert('Sucesso', 'Relatório salvo com sucesso!');
      console.log('Relatório salvo:', response);
      setSelectedImages([]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o relatório.');
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const toggleMetodologiaSelection = (metodologia) => {
    setSelectedMetodologias((prev) => {
      if (prev.includes(metodologia)) {
        return prev.filter((item) => item !== metodologia);
      } else {
        return [...prev, metodologia];
      }
    });
  };

  useEffect(() => {
    const fetchMetodologias = async () => {
      const metodologiasData = await getMetodologias(user.userId);
      setMetodologias(metodologiasData.metodologias);
    };
    const fetchTurma = async () => {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
      setLoading(false);
    };

    fetchMetodologias();
    fetchTurma();
  }, [turmaId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#006400" />
          ) : turma ? (
            <TurmaCard2
              turma={{
                turmaId: turma.$id,
                title: turma.title,
                Horario_de_inicio: turma.Horario_de_inicio,
                Horario_de_termino: turma.Horario_de_termino,
                Local: turma.Local,
                Dia1: turma.Dia1,
                Dia2: turma.Dia2,
                Dia3: turma.Dia3,
                MaxAlunos: turma.MaxAlunos,
              }}
            />
          ) : (
            <Text>Carregando dados da turma...</Text>
          )}
        </View>

        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
          <Text style={styles.input}>
            {form.data.toLocaleDateString('pt-BR')}
          </Text>
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
            {form.hora ? form.hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Selecione a hora'}
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

        <Text style={styles.label}>Selecione as Metodologias Aplicadas</Text>
        <View style={[styles.metodologiasContainer, { flexWrap: 'wrap', maxHeight: 300 }]}>
          {Array.isArray(metodologias) && metodologias.map((metodologia, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.metodologiaCard, selectedMetodologias.includes(metodologia) && styles.selectedCard]}
              onPress={() => toggleMetodologiaSelection(metodologia)}
            >
              <Text style={styles.metodologiaText}>{metodologia}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
            <Icon name="save" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={handleUploadImages}>
            <Icon name="image" size={24} color="#fff" />
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
    padding: 16,
    flexGrow: 1,
  },
  cardContainer: {
    marginTop: 40,
    width: '100%',
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
  metodologiasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  metodologiaCard: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#006400',
  },
  metodologiaText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  menuButton: {
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

export default Relatorios;
