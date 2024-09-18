import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAlunosByTurmaId, salvarChamada } from '@/lib/appwrite'; // Função para buscar alunos por turma e salvar a chamada
import { useLocalSearchParams, router } from 'expo-router'; // Para pegar parâmetros da rota
import { MaskedTextInput } from 'react-native-mask-text'; // Biblioteca para adicionar a máscara de data

const TurmaChamadas = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]); // Alunos presentes
  const [searchDate, setSearchDate] = useState(''); // Data com máscara

  // Pegando o turmaId e turmaTitle via parâmetros
  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunos();
  }, [turmaId]);

  // Função para buscar alunos pelo turma_id
  const fetchAlunos = async () => {
    try {
      const alunosData = await getAlunosByTurmaId(turmaId); // Função que busca alunos com o turma_id correspondente
      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10)); // Inicia mostrando 10 alunos
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  // Função para selecionar ou desmarcar um aluno
  const handleSelectAluno = (id) => {
    if (selectedAlunos.includes(id)) {
      setSelectedAlunos(selectedAlunos.filter((selectedId) => selectedId !== id)); // Desmarcar
    } else {
      setSelectedAlunos([...selectedAlunos, id]); // Marcar como presente
    }
  };

  // Função para salvar a chamada
  const handleSave = async () => {
    try {
      // Alunos ausentes são aqueles que não foram selecionados
      const ausentes = alunos.filter((aluno) => !selectedAlunos.includes(aluno.$id)).map(aluno => aluno.$id);

      // Chama a função que salva a chamada no Appwrite
      await salvarChamada({
        data: searchDate,
        turma_id: turmaId,
        presentes: selectedAlunos, // Alunos presentes (selecionados)
        ausentes: ausentes // Alunos ausentes
      });

      Alert.alert('Sucesso', 'Chamada registrada com sucesso');
      router.replace(`/turmas`); // Redireciona para a lista de turmas
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível salvar a chamada');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Registrar Chamada da Turma {turmaTitle}
      </Text>

      {/* Campo de Input com máscara de data */}
      <MaskedTextInput
        mask="99-99-9999" // Máscara para dd-mm-yyyy
        placeholder="Digite a data (dd-mm-yyyy)"
        value={searchDate}
        onChangeText={setSearchDate}
        keyboardType="numeric"
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

      <CustomButton title="Salvar Chamada" handlePress={handleSave} />
    </SafeAreaView>
  );
};

export default TurmaChamadas;
