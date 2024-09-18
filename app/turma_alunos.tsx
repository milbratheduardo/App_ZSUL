import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router'; // Hook para pegar parâmetros
import { getAlunosByTurmaId } from '@/lib/appwrite'; // Função para buscar alunos pela turma_id

const TurmaAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunosByTurma();
  }, [turmaId]);

  console.log('Turma ID: ', turmaId);
  console.log('Title: ', turmaTitle);

  const fetchAlunosByTurma = async () => {
    try {
      const alunosData = await getAlunosByTurmaId(turmaId);
      console.log('Alunos retornados:', alunosData);

      if (alunosData.length === 0) {
        console.warn('Nenhum aluno foi encontrado para essa turma.');
      }

      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10)); 
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
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

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Alunos da Turma {turmaTitle}
      </Text>

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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: 'white',
            }}
          >
            <Text>{item.username}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default TurmaAlunos;
