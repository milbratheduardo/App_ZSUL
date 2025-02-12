import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, TouchableOpacity,RefreshControl} from 'react-native';
import TurmasCard2 from '@/components/TurmaCard2';
import { useLocalSearchParams } from 'expo-router';
import { getTurmaById, getAllRelatorios } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AllRelatorios = () => {
  const [turma, setTurma] = useState(null);
  const [relatorios, setRelatorios] = useState([]);
  const { turmaId } = useLocalSearchParams();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchTurma = async () => {
      try {
        const turmaData = await getTurmaById(turmaId);
        setTurma(turmaData);
      } catch (error) {
        setErrorMessage(`Erro ao buscar turma.`);
        setShowErrorModal(true);
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
        setErrorMessage(`Erro, não foi possível buscar os relatórios.`);
        setShowErrorModal(true);
      }
    };

    fetchTurma();
    fetchRelatorios();
  }, [turmaId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRelatorios();
    setRefreshing(false);
  };

  const renderRelatorio = ({ item }) => (
    <View style={styles.relatorioCard}>
      <Text style={styles.relatorioDate}>
        📅 Data: <Text style={styles.highlight}>{item.data}</Text>
      </Text>
      <Text style={styles.relatorioTime}>
        ⏰ Hora: <Text style={styles.highlight}>{item.hora}</Text>
      </Text>
      <Text style={styles.relatorioDetails}>
        📝 Metodologias: <Text style={styles.highlight}>{item.metodologias.join(', ') || 'Nenhuma'}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topCardContainer}>
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
          <Text style={styles.loadingText}>Carregando dados da turma...</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Relatórios de Treino</Text>

      {relatorios.length === 0 ? (
        <Text style={styles.noRelatoriosText}>Nenhum relatório encontrado para esta turma</Text>
      ) : (
        <FlatList
          data={relatorios}
          keyExtractor={(item) => item.$id}
          renderItem={renderRelatorio}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'red',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            width: '80%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
              Erro
            </Text>
            <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 5,
              }}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f6',
  },
  topCardContainer: {
    marginTop: 30, // Adicionado para dar espaço entre o topo da tela e o card
    marginBottom: 10, // Espaço entre o card e o próximo título
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  noRelatoriosText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  relatorioCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#126046',
  },
  relatorioDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  relatorioTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginVertical: 4,
  },
  relatorioDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#126046',
  },
});

export default AllRelatorios;
