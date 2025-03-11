import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos, getAllFaturas } from '@/lib/appwrite';

const HistoricoPagamentos2 = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  
  const [alunos, setAlunos] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const alunosData = await getAllAlunos();
      const faturasData = await getAllFaturas();
      setAlunos(alunosData);
      setFilteredAlunos(alunosData);
      setFaturas(faturasData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para encontrar o plano do atleta
  const getPlanoAtleta = (userId) => {
    const fatura = faturas.find((f) => f.atletaId === userId);
    return fatura ? fatura.plano : 'Sem Assinatura';
  };

  // Cores para cada plano
  const getPlanoBackgroundColor = (plano) => {
    switch (plano) {
      case 'Mensal':
        return '#ADD8E6'; // Azul claro
      case 'Semestral':
        return '#D8BFD8'; // Roxo claro
      case 'Anual':
        return '#FFDAB9'; // Laranja claro
      default:
        return '#D3D3D3'; // Cinza (Sem Assinatura)
    }
  };

  // Filtragem de alunos pela barra de pesquisa
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = alunos.filter((aluno) =>
      aluno.nome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const handleAlunoPress = (alunoId, alunoNome) => {
    router.push({
      pathname: '/ver_faturas_admin',
      params: { atletaId: alunoId, atletaNome: alunoNome }
    });
  };

  const renderAluno = ({ item }) => {
    const plano = getPlanoAtleta(item.userId);
    const backgroundColor = getPlanoBackgroundColor(plano);

    return (
      <TouchableOpacity
        style={[styles.alunoContainer, { backgroundColor }]}
        onPress={() => handleAlunoPress(item.userId, item.nome)}
      >
        <Text style={styles.alunoNome}>{item.nome}</Text>
        <Text style={styles.planoText}>{plano}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Histórico de Pagamentos</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por nome"
        value={searchText}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#126046" />
      ) : (
        <FlatList
          data={filteredAlunos}
          keyExtractor={(item) => item.userId}
          renderItem={renderAluno}
          style={styles.alunosList}
        />
      )}
    </SafeAreaView>
  );
};

export default HistoricoPagamentos2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  alunosList: {
    marginTop: 10,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  planoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
