import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, addAlunoToTurma } from '@/lib/appwrite'; // Função para buscar todos os alunos e cadastrar aluno na turma
import { useLocalSearchParams, router } from 'expo-router'; // Corrigido para usar useLocalSearchParams

const CadastrarAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Usando useLocalSearchParams para obter o turmaId e turmaTitle
  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos(); // Função para pegar todos os alunos
      // Filtra alunos cujo turma_id seja null
      const alunosComTurmaIdNull = alunosData.filter((aluno) => aluno.turma_id === null);
      setAlunos(alunosComTurmaIdNull);
      setFilteredAlunos(alunosComTurmaIdNull.slice(0, 10)); // Iniciar com 10 alunos
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

  const handleSave = async () => {
    try {
      // Função para adicionar os alunos selecionados à turma
      for (const alunoId of selectedAlunos) {
        await addAlunoToTurma(alunoId, turmaId); // Adiciona cada aluno à turma
      }
      Alert.alert('Sucesso', 'Alunos cadastrados com sucesso');
      router.replace(`/turmas`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar os alunos');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Cadastrar Alunos na Turma {turmaTitle}
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

export default CadastrarAlunos;
