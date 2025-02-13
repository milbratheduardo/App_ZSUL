import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput, RefreshControl, Modal } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { getAllTurmas, getAlunosByTurmaId, getAllAlunos, getTurmaById } from '@/lib/appwrite'; 
import { images } from '@/constants'; 
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const History = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      let alunosData = [];
  
      // Função auxiliar para buscar o título da turma
      const getTurmaTitle = async (turmaId) => {
        try {
          const turmas = await getAllTurmas();
          const turma = turmas.find((t) => t.$id === turmaId);
          return turma ? turma.title : 'Nenhuma Turma';
        } catch (error) {
          setErrorMessage('Erro ao buscar título da turma.');
          setShowErrorModal(true);
          return 'Nenhuma Turma';
        }
      };
  
      if (user.admin === 'admin') {
        const allAlunos = await getAllAlunos();

        alunosData = await Promise.all(
          allAlunos.map(async (aluno) => {
            const turmaTitle = aluno.turmaId ? await getTurmaTitle(aluno.turmaId) : 'Nenhuma Turma';
            return { ...aluno, turmaTitle };
          })
        );
      } else if (user.role === 'responsavel') {
        const allAlunos = await getAllAlunos();
        
        alunosData = await Promise.all(
          allAlunos
            .filter((aluno) => aluno.nomeResponsavel === user.cpf)
            .map(async (aluno) => {
              const turmaTitle = aluno.turmaId ? await getTurmaTitle(aluno.turmaId) : 'Nenhuma Turma';
              return { ...aluno, turmaTitle };
            })
        );
      } else if (user.role === 'atleta') {
        try {
          const allAlunos = await getAllAlunos();
          const currentAluno = allAlunos.find((aluno) => aluno.userId === user.userId);
      
          if (currentAluno && currentAluno.turmaId) {
            const alunosDaMesmaTurma = await getAllAlunos();
            
            alunosData = await Promise.all(
              alunosDaMesmaTurma.map(async (aluno) => {
                const turmaTitle = aluno.turmaId ? await getTurmaTitle(aluno.turmaId) : 'Nenhuma Turma';
                return { ...aluno, turmaTitle };
              })
            );
          } else {
            console.log('Nenhuma turma encontrada para o usuário.');
            alunosData = [];
          }
        } catch (error) {
          console.error('Erro ao buscar alunos da mesma turma:', error);
        }
      }
      
  
      setAlunos(alunosData);
      setFilteredAlunos(alunosData);
    } catch (error) {
      setErrorMessage('Erro ao buscar dados.');
      setShowErrorModal(true);
    }
  }, [user]);
  
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const handleAlunoPress = (alunoId) => {
    router.push({
      pathname: '/detalhesAluno',
      params: { alunoId }
    });
  };

  const renderAluno = ({ item }) => {
    const positionDetails = {
      'goleiro': { abbreviation: 'GL', color: '#800080' },
      'zagueiro-central': { abbreviation: 'ZC', color: '#1E90FF' },
      'lateral-direito': { abbreviation: 'LD', color: '#1E90FF' },
      'lateral-esquerdo': { abbreviation: 'LE', color: '#1E90FF' },
      'volante': { abbreviation: 'VOL', color: '#32CD32' },
      'meia-central': { abbreviation: 'MC', color: '#32CD32' },
      'meia-ofensivo': { abbreviation: 'MO', color: '#32CD32' },
      'meia-defensivo': { abbreviation: 'MD', color: '#32CD32' },
      'ponta-direita': { abbreviation: 'PD', color: '#FF6347' },
      'ponta-esquerda': { abbreviation: 'PE', color: '#FF6347' },
      'centroavante': { abbreviation: 'CA', color: '#FF6347' },
    };

    const position = positionDetails[item.posicao.toLowerCase()] || {};
    const nomeCompleto = item.nome.trim().split(' ');
    const alunoInfo = nomeCompleto.length > 1 
      ? `${nomeCompleto[0]} ${nomeCompleto[nomeCompleto.length - 1]}` 
      : nomeCompleto[0];
    
    return (
      <TouchableOpacity style={styles.alunoContainer} onPress={() => handleAlunoPress(item.userId)}>
        <View style={styles.alunoInfo}>
          <Image source={{ uri: item.avatar }} style={styles.alunoAvatar} />
          <Text style={styles.alunoNome}>{alunoInfo}</Text>
        </View>
        <View style={[styles.posicaoContainer, { backgroundColor: position.color || '#808080' }]}>
          <Text style={styles.posicaoText}>{position.abbreviation || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  }    

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 200 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={styles.welcomeText}>Bem Vindo</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <Image source={images.escola_sp_transparente} style={styles.logo} />
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="filter-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TextInput
            placeholder="Pesquisar por nome do atleta"
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>


        {filteredAlunos.length === 0 ? (
          <Text style={styles.noAlunosText}>Alunos</Text>
        ) : (
          <FlatList
            data={filteredAlunos}
            keyExtractor={(item) => item.$id}
            renderItem={renderAluno}
            style={styles.alunosList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
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
    </SafeAreaView>
  );
};

export default History;
const styles = StyleSheet.create({
  logo: {
    width: 115,
    height: 90,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#126046',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
  },
  alunosList: {
    marginTop: 10,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  alunoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alunoAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  posicaoContainer: {
    width: 50,
    borderRadius: 5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posicaoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  noAlunosText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});