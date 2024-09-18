import { View, Text, FlatList, Alert, Modal, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChamadasByTurmaId, getAlunosById } from '@/lib/appwrite'; // Função para buscar chamadas por turma e aluno por ID
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router, useLocalSearchParams } from 'expo-router';

const VerChamadas = () => {
  const [chamadas, setChamadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChamada, setSelectedChamada] = useState(null); // Estado para a chamada selecionada
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para exibir o modal
  const [presentesNomes, setPresentesNomes] = useState([]); // Nomes dos presentes
  const [ausentesNomes, setAusentesNomes] = useState([]); // Nomes dos ausentes
  const { user } = useGlobalContext();
  
  // Pegando turmaId e turmaTitle da rota
  const { turmaId, turmaTitle } = useLocalSearchParams();

  const fetchChamadas = async () => {
    setIsLoading(true);
    try {
      const response = await getChamadasByTurmaId(turmaId); // Busca todas as chamadas da turma
      setChamadas(response);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChamadas();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchChamadas();
  }, [turmaId]);

  // Função para buscar o nome de um aluno pelo ID
  const fetchAlunosNomes = async (alunosIds, setAlunosNomes) => {
    try {
      const nomes = await Promise.all(
        alunosIds.map(async (alunoId) => {
          const alunoData = await getAlunosById(alunoId);
          return alunoData.username;
        })
      );
      setAlunosNomes(nomes);
    } catch (error) {
      console.error('Erro ao buscar nomes dos alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os nomes dos alunos');
    }
  };

  const handleChamadaPress = (chamada) => {
    setSelectedChamada(chamada); // Define a chamada selecionada
    setIsModalVisible(true); // Abre o modal

    // Buscar os nomes dos alunos presentes e ausentes
    fetchAlunosNomes(chamada.presentes, setPresentesNomes);
    fetchAlunosNomes(chamada.ausentes, setAusentesNomes);
  };

  const closeModal = () => {
    setIsModalVisible(false); // Fecha o modal
    setSelectedChamada(null); // Limpa a chamada selecionada
    setPresentesNomes([]); // Limpa os nomes
    setAusentesNomes([]); // Limpa os nomes
  };

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={chamadas}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleChamadaPress(item)}>
            <View style={{ padding: 10, backgroundColor: 'white', marginVertical: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.data}</Text>
              <Text>Presentes: {item.presentes.length}</Text>
              <Text>Ausentes: {item.ausentes.length}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="w-full pt-5 pb-2">
              <Text className="text-primary text-lg font-pregular mb-1">
                Chamadas da Turma {turmaTitle}
              </Text>
              {user.role === 'admin' && (
                <View classname='mt-4'>
                    <CustomButton 
                    title="Cadastrar Chamada"
                    handlePress={() => router.push({
                        pathname: '/turma_chamadas',
                        params: { turmaId, turmaTitle },
                    })}
                    containerStyles=" mr-20 mt-4 p-3"
                    />
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Chamada Encontrada"
            subtitle="Não há chamadas registradas para esta turma"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal */}
      {selectedChamada && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-xl font-semibold mb-4 text-center">Chamada de {selectedChamada.data}</Text>
              <Text style={{ fontWeight: 'bold' }}>Presentes:</Text>
              {presentesNomes.map((nome, index) => (
                <Text key={index}>{nome}</Text> // Mostra o nome dos alunos presentes
              ))}
              <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Ausentes:</Text>
              {ausentesNomes.map((nome, index) => (
                <Text key={index}>{nome}</Text> // Mostra o nome dos alunos ausentes
              ))}

              <CustomButton 
                title="Fechar" 
                containerStyles="ml-10 mr-10 p-4 mt-4"
                handlePress={closeModal} 
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default VerChamadas;
