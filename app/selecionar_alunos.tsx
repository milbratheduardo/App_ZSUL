import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos } from '../lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router'; // Corrigido para usar useLocalSearchParams

const SelecionarAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // UseLocalSearchParams para obter os parâmetros
  const { selectedAlunos: selectedAlunosFromParams, Title, Date_event, Description, Hora_event } = useLocalSearchParams();


  useEffect(() => {
    if (selectedAlunosFromParams) {
      setSelectedAlunos(selectedAlunosFromParams.split(','));
    }
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10)); // Iniciar com 10 alunos
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos.slice(0, 10));
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.username.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
    }
  };

  const handleSelectAluno = (id) => {
    if (selectedAlunos.includes(id)) {
      setSelectedAlunos(selectedAlunos.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedAlunos([...selectedAlunos, id]);
    }
  };

  const handleSave = () => {
    router.replace({
      pathname: '/cadastro_eventos',
      params: {
        selectedAlunosIds: selectedAlunos.join(','),
        type: 'partida',
        Title,
        Date_event,
        Description,
        Hora_event
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="Buscar aluno"
        value={searchQuery}
        onChangeText={handleSearch}
        style={{ padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10 }}
      />

      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.$id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: selectedAlunos.includes(item.$id) ? 'lightgray' : 'white',
            }}
            onPress={() => handleSelectAluno(item.$id)}
          >
            <Text>{item.username}</Text>
            <Text style={{ fontSize: 18 }}>{selectedAlunos.includes(item.$id) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      <CustomButton title="Salvar Seleção" handlePress={handleSave} />
    </SafeAreaView>
  );
};

export default SelecionarAlunos;
