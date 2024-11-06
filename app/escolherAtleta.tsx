import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { getAllAlunos, salvarChamada, getTurmaById, addAlunoToTurma } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';

const EscolherAtleta = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [turma, setTurma] = useState(null);

  // Capturando os parâmetros position e turmaId
  const { turmaId, turmaTitle, position } = useLocalSearchParams();

 

  useEffect(() => {
    fetchAlunos();
    fetchTurma();
  }, [turmaId, position]);

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
    } catch (error) {
      console.error('Erro ao buscar turma:', error.message);
    }
  };


  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      
      // Aplicando o filtro diretamente no resultado de getAllAlunos
      const alunosFiltrados = alunosData.filter((aluno) =>
        (!aluno.turmaId || aluno.turmaId === '') && 
        (position === "qualquer" || aluno.posicao === position)
      );
      

      setAlunos(alunosFiltrados);
      setFilteredAlunos(alunosFiltrados.slice(0, 10));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSelectAluno = (userId) => {
    if (selectedAlunos.includes(userId)) {
      setSelectedAlunos(selectedAlunos.filter((selectedId) => selectedId !== userId));
    } else {
      setSelectedAlunos([...selectedAlunos, userId]);
    }
  };

  const handleSave = async () => {
    try {
      // Para cada aluno selecionado, chame addAlunoToTurma com o userId e turmaId
      for (const userId of selectedAlunos) {
        await addAlunoToTurma(userId, turmaId);
      }
      
      Alert.alert('Sucesso', 'Alunos cadastrados na turma com sucesso');
      router.replace(`/turmas`);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível cadastrar os alunos na turma');
    }
  };
  


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolher Atleta para a Posição: {position}</Text>
      </View>

      {turma ? (
        <TurmasCard2
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
        <Text>Carregando informações da turma...</Text>
      )}

      <Text style={styles.subtitle}>Selecione os Atletas</Text>

      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alunoContainer,
              selectedAlunos.includes(item.userId) && styles.alunoSelecionado,
            ]}
            onPress={() => handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>
              {selectedAlunos.includes(item.userId) ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyles="rounded-lg w-[180px] h-[40px]"
          title="Registrar"
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
  datePicker: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerText: {
    color: '#333',
    fontSize: 16,
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

export default EscolherAtleta;
