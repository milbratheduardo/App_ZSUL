import { View, Text, FlatList, Image, RefreshControl, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllTurmas } from '@/lib/appwrite';
import EmptyState from '@/components/EmptyState';
import TurmasCard from '@/components/TurmaCard';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

const Turmas = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState(null); // Estado para a turma selecionada
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para exibir o modal
  const { user } = useGlobalContext();

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await getAllTurmas();
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstName = user?.username.split(' ')[0];

  const handleTurmaPress = (turma) => {
    setSelectedTurma(turma); // Define a turma selecionada
    setIsModalVisible(true); // Abre o modal
  };

  const closeModal = () => {
    setIsModalVisible(false); // Fecha o modal
    setSelectedTurma(null); // Limpa a turma selecionada
  };

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TurmasCard turma={item} onPress={() => handleTurmaPress(item)} /> // Passa a função de clique
        )}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-2">
              <View>
                <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
                <Text className="text-2xl font-psemibold text-golden">{firstName}</Text>
              </View>
              <View className="mt-1.5">
                <Image source={images.logo_zsul} className="w-[115px] h-[35px]" />
              </View>
            </View>
            <View className="w-full flex-row items-center justify-between pt-5 pb-2">
              <Text className="text-primary text-lg font-pregular mb-1">
                Turmas Disponíveis
              </Text>
              {user.role === 'admin' && (
                <CustomButton 
                  title="Nova Turma"
                  handlePress={() => router.push('/cadastro_turma')}
                  containerStyles="ml-4 p-3"
                />
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Turma Encontrada"
            subtitle="Não foi criada nenhuma turma"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal */}
      {selectedTurma && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-xl font-semibold mb-4 text-center">{selectedTurma.title}</Text>
              <CustomButton 
                title="Ver Alunos" 
                containerStyles="ml-10 mr-10 p-4"
                handlePress={() => {
                  closeModal();
                  router.push({
                    pathname: `/turma_alunos`,
                    params: { turmaId: selectedTurma.$id, turmaTitle: selectedTurma.title },
                  });
                }} 
              />
              {user.role === 'admin' && (
                  <>
                    <CustomButton 
                      title="Chamadas" 
                      containerStyles="ml-10 mr-10 p-4 mt-4"
                      handlePress={() => {
                        closeModal();
                        router.push({
                          pathname: `/ver_chamadas`,
                          params: { turmaId: selectedTurma.$id, turmaTitle: selectedTurma.title },                        
                        });
                      }} 
                    />
                    <CustomButton 
                      title="Cadastrar Alunos" 
                      containerStyles="ml-10 mr-10 p-4 mt-4"
                      handlePress={() => {
                        closeModal();
                        router.push({
                          pathname: `/cadastrar_alunos`,
                          params: { turmaId: selectedTurma.$id, turmaTitle: selectedTurma.title },
                        });
                      }} 
                    />
                  </>
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

export default Turmas;
