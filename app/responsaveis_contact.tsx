import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getAlunosByTurmaId } from '@/lib/appwrite';

const ResponsaveisContact = () => {
  const { turmaId } = useLocalSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const turmaAlunos = await getAlunosByTurmaId(turmaId);
        setAlunos(turmaAlunos);
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar os dados dos alunos.");
        console.error("Erro ao buscar alunos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [turmaId]);

  const renderAlunoCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.alunoNome}>{item.nome}</Text>
      <Text style={styles.responsavelNome}>Responsável: {item.nomeResponsavel}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contatos dos Responsáveis</Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.$id}
          renderItem={renderAlunoCard}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default ResponsaveisContact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  responsavelNome: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
});
