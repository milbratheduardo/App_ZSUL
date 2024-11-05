import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
        presentesIds.map(async (userId) => {
          const aluno = await getAlunosById(userId);
          return aluno;
        })
      );

      const ausentesAlunos = await Promise.all(
        ausentesIds.map(async (userId) => {
          const aluno = await getAlunosById(userId);
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

  const handleSelectAluno = (userId) => {
    if (presentes.includes(userId)) {
      setPresentes(presentes.filter((presentId) => presentId !== userId));
      setAusentes([...ausentes, userId]);
    } else if (ausentes.includes(userId)) {
      setAusentes(ausentes.filter((ausenteId) => ausenteId !== userId));
      setPresentes([...presentes, userId]);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {chamada && turma && (
          <Text style={styles.title}>Chamada do Dia {chamada.data} da {turma.title}</Text>
        )}
      </View>

      <Text style={styles.subtitle}>Selecione apenas os presentes</Text>

      <FlatList
        data={alunos}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alunoContainer,
              presentes.includes(item.userId) && styles.alunoSelecionado,
            ]}
            onPress={() => handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>{presentes.includes(item.userId) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyles="rounded-lg w-[180px] h-[40px]"
          title="Salvar Alterações"
          handlePress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  alunoSelecionado: {
    backgroundColor: '#d0f0d0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#126046',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default EditarChamadas;
