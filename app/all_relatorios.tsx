import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import TurmasCard2 from '@/components/TurmaCard2';
import { useLocalSearchParams } from 'expo-router';
import { getTurmaById, getAllRelatorios } from '@/lib/appwrite';

const AllRelatorios = () => {
  const [turma, setTurma] = useState(null);
  const [relatorios, setRelatorios] = useState([]);
  const { turmaId } = useLocalSearchParams();

  useEffect(() => {
    const fetchTurma = async () => {
      try {
        const turmaData = await getTurmaById(turmaId);
        setTurma(turmaData);
      } catch (error) {
        console.error('Erro ao buscar turma:', error.message);
      }
    };

    const fetchRelatorios = async () => {
      try {
        const allRelatorios = await getAllRelatorios();
        const filteredRelatorios = allRelatorios.filter(
          (relatorio) => relatorio.turmaId === turmaId
        );
        setRelatorios(filteredRelatorios);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os relatórios');
        console.error(error);
      }
    };

    fetchTurma();
    fetchRelatorios();
  }, [turmaId]);

  const renderRelatorio = ({ item }) => (
    <View style={styles.relatorioCard}>
      <Text style={styles.relatorioText}>Data: {item.data}</Text>
      <Text style={styles.relatorioText}>Hora: {item.hora}</Text>
      <Text style={styles.relatorioText}>
        Metodologias: {item.metodologias.join(', ') || 'Nenhuma'}
      </Text>
      <Text style={styles.relatorioText}>
        Imagens: {item.imagens.length > 0 ? `${item.imagens.length} imagens` : 'Nenhuma'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
        <Text>Carregando dados da turma...</Text>
      )}

      <Text style={styles.sectionTitle}>Relatórios de Treino</Text>

      {relatorios.length === 0 ? (
        <Text style={styles.noRelatoriosText}>Nenhum relatório encontrado para esta turma</Text>
      ) : (
        <FlatList
          data={relatorios}
          keyExtractor={(item) => item.$id}
          renderItem={renderRelatorio}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    marginTop: 20,
    marginBottom: 10,
  },
  noRelatoriosText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  relatorioCard: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  relatorioText: {
    fontSize: 14,
    color: '#333',
  },
});

export default AllRelatorios;
