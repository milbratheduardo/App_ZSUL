import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import TurmaCard2 from '@/components/TurmaCard2';
import { TextInputMask } from 'react-native-masked-text';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { launchImageLibraryAsync } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { getTurmaById, salvarRelatorio, getMetodologias, getGaleriaImagens } from '@/lib/appwrite';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';

const Relatorios = () => {
  const { turmaId, turmaTitle } = useLocalSearchParams();
  const [form, setForm] = useState({ data: '', hora: new Date(), local: '' });
  const [metodologias, setMetodologias] = useState([]);
  const [selectedMetodologias, setSelectedMetodologias] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageNames, setImageNames] = useState([]);
  const [turma, setTurma] = useState(null);
  const { user } = useGlobalContext();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleUploadImages = async () => {
    router.push('/enviar_fotoTreino')
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
    fetchMetodologias();

    const fetchImages = async () => {
      const imagesData = await getGaleriaImagens(user.userId);
      setImageNames(imagesData.map(img => img.title)); // Lista de nomes das imagens
    };
    fetchImages();
  }, [turmaId]);


  useEffect(() => {
    const fetchTurma = async () => {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
    };
    fetchTurma();
  }, [turmaId]);

  const handleSaveRelatorio = async () => {
    try {
      const relatorioData = {
        userId: user.userId,
        turmaId,
        data: form.data,
        hora: form.hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        local: form.local,
        metodologias: selectedMetodologias,
        imagens: selectedImages,
      };

      const response = await salvarRelatorio(relatorioData);
      Alert.alert('Sucesso', 'Relatório salvo com sucesso!');
      console.log('Relatório salvo:', response);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o relatório.');
      console.error('Erro ao salvar relatório:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {turma ? (
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
        <View style={styles.inputContainer}>
          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY' }}
            value={form.data}
            onChangeText={(e) => setForm({ ...form, data: e })}
            placeholder="DD/MM/YYYY"
            style={styles.input}
          />
        </View>

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

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.label}>Selecione as Metodologias Aplicadas</Text>
        </View>
        <View style={styles.metodologiasContainer}>
          {Array.isArray(metodologias) && metodologias.map((metodologia, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.metodologiaCard,
                selectedMetodologias.includes(metodologia) && styles.selectedCard,
              ]}
              onPress={() => toggleMetodologiaSelection(metodologia)}
            >
              <Text style={styles.metodologiaText}>{metodologia}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {imageNames.length > 0 && (
          <View style={styles.fileContainer}>
            <Text style={styles.fileLabel}>Imagens Selecionadas:</Text>
            {imageNames.map((name, index) => (
              <Text key={index} style={styles.fileText}>{name}</Text>
            ))}
          </View>
        )}

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <CustomButton
            containerStyles='rounded-lg w-[180px] h-[40px]'
            title="Salvar Seleção"
            handlePress={handleSaveRelatorio}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.optionsButton} onPress={toggleMenu}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menuOptions}>
          <TouchableOpacity style={styles.menuOption} onPress={handleUploadImages}>
            <Icon name="image" size={18} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuText}>Adicionar Imagens</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={() => router.push('/ver_relatorios')}>
            <Icon name="file-text" size={18} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuText}>Ver Relatórios já salvos</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginTop: 64,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 8,
    fontWeight: 'bold',
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
    flexWrap: 'wrap',
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
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    backgroundColor: '#006400',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  menuOptions: {
    position: 'absolute',
    bottom: 150,
    right: 30,
    backgroundColor: '#006400',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    width: 220,
    zIndex: 4,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  fileContainer: {
    marginTop: 10,
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fileText: {
    fontSize: 14,
    color: '#555',
  },
});

export default Relatorios;
