import { View, Text, FlatList, Alert, Modal, RefreshControl, TouchableOpacity, TextInput, Animated } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChamadasByTurmaId, getAlunosById, deleteChamadaById } from '@/lib/appwrite'; // Função para buscar e deletar chamadas
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons'; // Biblioteca de ícones

const VerChamadas = () => {
  const [chamadas, setChamadas] = useState([]);
  const [filteredChamadas, setFilteredChamadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
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
      setChamadas(response.reverse());
      setFilteredChamadas(response.reverse()); // Inicia com todas as chamadas
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

  // Função para deletar a chamada por ID
  const handleDeleteChamada = async (chamadaId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta chamada?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await deleteChamadaById(chamadaId); // Função que deleta a chamada
              fetchChamadas(); // Atualiza a lista de chamadas
              Alert.alert("Sucesso", "Chamada excluída com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a chamada.");
            }
          },
          style: "destructive",
        }
      ]
    );
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

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible); // Alterna a exibição da barra de pesquisa
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = chamadas.filter((chamada) => chamada.data.includes(text));
    setFilteredChamadas(filtered);
  };

  return (
    <SafeAreaView className="bg-gray h-full">
  <FlatList
    data={filteredChamadas}
    keyExtractor={(item) => item.$id}
    renderItem={({ item }) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginVertical: 5, borderRadius: 20, padding: 10 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleChamadaPress(item)}>
          <View>
            <Text style={{ fontWeight: 'bold' }}>{item.data}</Text>
            <Text>Presentes: {item.presentes.length}</Text>
            <Text>Ausentes: {item.ausentes.length}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Ícone de Lixeira para deletar a chamada */}
        {(user.role == 'admin' || user.role == 'professor') && (
        <TouchableOpacity onPress={() => handleDeleteChamada(item.$id)} style={{ marginLeft: 10 }}>
          <AntDesign name="delete" size={24} color="red" />
        </TouchableOpacity>
        )}
      </View>
    )}
    contentContainerStyle={{ paddingBottom: 63 }}
    ListHeaderComponent={() => (
      <View className="my-6 px-4 space-y-6">
        <View className="w-full pt-5 pb-2 items-center">
          <Text className="text-primary text-sm font-pregular mb-1">
            Chamadas da Turma {turmaTitle}
          </Text>
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

  {/* Botão circular com '+' no canto inferior direito */}
      {/* Container da barra de pesquisa e botão de lupa */}
      <View style={{ position: 'absolute', bottom: 100, right: 30, flexDirection: 'row-reverse', alignItems: 'center' }}>
  {/* Botão de Lupa */}
  <TouchableOpacity
    onPress={handleSearchToggle}
    style={{
      backgroundColor: '#126046',
      borderRadius: 50,
      padding: 20,
      elevation: 5,
    }}
  >
    <Feather name="search" size={24} color="white" />
  </TouchableOpacity>

  {/* Barra de Pesquisa */}
  {searchVisible && (
    <TextInput
      placeholder="Pesquisar por data (dd-mm-yyyy)"
      value={searchText}
      onChangeText={handleSearch}
      style={{
        padding: 10,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        elevation: 5,
        marginRight: 10,
        width: 230, // Espaço entre a barra de pesquisa e o botão de lupa
      }}
    />
  )}
</View>

{/* Botão de '+' */}
<View style={{ position: 'absolute', bottom: 30, right: 30 }}>
  {(user.role == 'admin' || user.role == 'professor') && (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/turma_chamadas',
          params: { turmaId, turmaTitle },
        })
      }
      style={{
        backgroundColor: '#126046',
        borderRadius: 50,
        padding: 20,
        elevation: 5,
      }}
    >
      <AntDesign name="plus" size={24} color="white" />
    </TouchableOpacity>
  )}
</View>


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

          {(user.role == 'admin' || user.role == 'professor') && (
          <CustomButton 
            title="Editar Chamada"
            handlePress={() => router.push({
                pathname: '/editar_chamadas',
                params: { turmaId, chamadaId: selectedChamada.$id },
            })}
            containerStyles="ml-10 mr-10 p-4 mt-10"
          />
        )}

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
