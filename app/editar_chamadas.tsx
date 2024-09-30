import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getChamadasByTurmaId, getAlunosById, getTurmaById, updateChamada } from '@/lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router';

const EditarChamadas = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [presentes, setPresentes] = useState([]);
  const [ausentes, setAusentes] = useState([]);
  const [turma, setTurma] = useState(null); // Para armazenar os dados da turma
  const [searchQuery, setSearchQuery] = useState('');
  const { turmaId, chamadaId } = useLocalSearchParams(); // Pegue o ID da turma e da chamada da rota
  const [chamada, setChamada] = useState(null); // Para armazenar a chamada selecionada

  useEffect(() => {
    fetchChamada();
    fetchTurma(); // Chama a função para buscar a turma
  }, []);

  const fetchChamada = async () => {
    try {
      const chamadas = await getChamadasByTurmaId(turmaId);
      const chamadaSelecionada = chamadas.find((chamada) => chamada.$id === chamadaId);
      if (chamadaSelecionada) {
        setChamada(chamadaSelecionada);
        await fetchAlunos(chamadaSelecionada.presentes, chamadaSelecionada.ausentes);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a chamada');
    }
  };

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData); // Armazena os dados da turma
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a turma');
    }
  };

  const fetchAlunos = async (presentesIds, ausentesIds) => {
    try {
      const presentesAlunos = await Promise.all(
        presentesIds.map(async (id) => {
          const aluno = await getAlunosById(id);
          return aluno;
        })
      );

      const ausentesAlunos = await Promise.all(
        ausentesIds.map(async (id) => {
          const aluno = await getAlunosById(id);
          return aluno;
        })
      );

      const allAlunos = [...presentesAlunos, ...ausentesAlunos];
      setAlunos(allAlunos);
      setFilteredAlunos(allAlunos.slice(0, 10));
      setPresentes(presentesIds);
      setAusentes(ausentesIds);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSelectAluno = (id) => {
    if (presentes.includes(id)) {
      setPresentes(presentes.filter((presentId) => presentId !== id));
      setAusentes([...ausentes, id]);
    } else if (ausentes.includes(id)) {
      setAusentes(ausentes.filter((ausenteId) => ausenteId !== id));
      setPresentes([...presentes, id]);
    }
  };

  const handleSave = async () => {
    try {
      await updateChamada(chamadaId, { presentes, ausentes });
      Alert.alert('Sucesso', 'Chamada atualizada com sucesso');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações da chamada');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {chamada && turma && (
        <Text className="text-xl font-semibold mb-4 text-center">
          Chamada do Dia {chamada.data} da {turma.title}
        </Text>
      )}

      <FlatList
        data={alunos}
        keyExtractor={(item) => item.$id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: presentes.includes(item.$id) ? 'lightgray' : 'white',
            }}
            onPress={() => handleSelectAluno(item.$id)}
          >
            <Text>{item.username}</Text>
            <Text style={{ fontSize: 18 }}>{presentes.includes(item.$id) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      <CustomButton title="Salvar Alterações" handlePress={handleSave} />
    </SafeAreaView>
  );
};

export default EditarChamadas;
