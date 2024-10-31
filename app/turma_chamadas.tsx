import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2'; // Importando TurmasCard2
import { getAlunosByTurmaId, salvarChamada } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';

const TurmaChamadas = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunos();
  }, [turmaId]);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAlunosByTurmaId(turmaId);
      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10));
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
      const ausentes = alunos
        .filter((aluno) => !selectedAlunos.includes(aluno.userId))
        .map((aluno) => aluno.userId);

      await salvarChamada({
        data: selectedDate.toISOString().split('T')[0],
        turma_id: turmaId,
        presentes: selectedAlunos,
        ausentes: ausentes,
      });

      Alert.alert('Sucesso', 'Chamada registrada com sucesso');
      router.replace(`/turmas`);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar a chamada');
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}></Text>
      </View>

      {/* Informações da Turma - TurmasCard2 */}
      <TurmasCard2
        turma={{
          turmaId,
          title: turmaTitle,
          Horario_de_inicio: '08:00',
          Horario_de_termino: '10:00',
          Local: 'Campo de Treinamento',
          Dia1: 'Segunda-feira',
          Dia2: 'Quarta-feira',
          Dia3: 'Sexta-feira',
          MaxAlunos: 20,
        }}
      />

      {/* Botão para selecionar a data */}
      <TouchableOpacity onPress={openDatePicker} style={styles.datePicker}>
        <Text style={styles.datePickerText}>Data: {selectedDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.subtitle}>Selecione apenas os presentes</Text>

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

export default TurmaChamadas;
