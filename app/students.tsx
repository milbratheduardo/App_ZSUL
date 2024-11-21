import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ProgressBarAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllTurmas, getAlunosByTurmaId } from '@/lib/appwrite';

const Students = () => {
  const { user } = useGlobalContext();
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [counts, setCounts] = useState({
    posicao: {}, objetivo: {}, alergias: {}, condicoesMedicas: {}, lesoesAnteriores: {}, anoEscolar: {}
  });

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const turmas = await getAllTurmas();
        const turmasFiltradas = turmas.filter(turma => turma.profissionalId.includes(user.userId));
        setTurmas(turmasFiltradas);
        console.log('Turmas filtradas:', turmasFiltradas);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
      }
    };

    fetchTurmas();
  }, [user.userId]);

  const handleTurmaChange = async (turmaId) => {
    setSelectedTurma(turmaId);
    if (turmaId) {
      const alunos = await getAlunosByTurmaId(turmaId);
      console.log('Alunos obtidos:', alunos);
      calculateCounts(alunos);
    } else {
      setCounts({
        posicao: {}, objetivo: {}, alergias: {}, condicoesMedicas: {}, lesoesAnteriores: {}, anoEscolar: {}
      });
    }
  };

  const calculateCounts = (alunos) => {
    const initialCounts = {
      posicao: {}, objetivo: {}, alergias: {}, condicoesMedicas: {}, lesoesAnteriores: {}, anoEscolar: {}
    };

    alunos.forEach(aluno => {
      ['posicao', 'objetivo', 'alergias', 'condicoesMedicas', 'lesoesAnteriores', 'anoEscolar'].forEach(coluna => {
        const valor = aluno[coluna] ? aluno[coluna].trim().toLowerCase() : 'nenhum';
        initialCounts[coluna][valor] = (initialCounts[coluna][valor] || 0) + 1;
      });
    });

    console.log('Contagens calculadas:', initialCounts);
    setCounts(initialCounts);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderProgressBar = (value, maxValue) => (
    <ProgressBarAndroid 
      styleAttr="Horizontal" 
      indeterminate={false} 
      progress={value / maxValue} 
      color="#126046" 
      style={styles.progressBar}
    />
  );

  const renderCategory = (title, data) => {
    const maxValue = Math.max(...Object.values(data));
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {Object.entries(data).map(([key, value], index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{capitalizeFirstLetter(key)}</Text>
            <Text style={styles.itemValue}>{value}</Text>
            {renderProgressBar(value, maxValue)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Informações Gerais das Turmas</Text>
      <Picker
        selectedValue={selectedTurma}
        onValueChange={(value) => handleTurmaChange(value)}
        style={styles.picker}
      >
        <Picker.Item label="Escolha uma Turma" value={null} />
        {turmas.map(turma => (
          <Picker.Item key={turma.$id} label={turma.title} value={turma.$id} />
        ))}
      </Picker>

      {selectedTurma && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderCategory("Distribuição de Posições", counts.posicao)}
          {renderCategory("Objetivo dos Alunos", counts.objetivo)}
          {renderCategory("Alergias", counts.alergias)}
          {renderCategory("Condições Médicas", counts.condicoesMedicas)}
          {renderCategory("Lesões Anteriores", counts.lesoesAnteriores)}
          {renderCategory("Ano Escolar", counts.anoEscolar)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F7FA',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  picker: {
    marginVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#126046',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 14,
    color: '#333',
  },
  itemValue: {
    fontSize: 12,
    color: '#126046',
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
});

export default Students;
