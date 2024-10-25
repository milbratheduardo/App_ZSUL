import { View, Text, FlatList, Image, RefreshControl, Alert, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllTurmas, deletarTurma } from '@/lib/appwrite';
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

  // Obter a data atual (número)
  const today = new Date();
  const currentDate = today.getDate(); // Ex: 24 se hoje for o dia 24 do mês
  const currentDay = today.getDay(); // Obtem o dia da semana (0 = domingo, 1 = segunda, etc.)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const [selectedDay, setSelectedDay] = useState(currentDate); // Inicializa o dia selecionado com a data atual

  // Função para gerar os dias dinamicamente com base na data atual
  const generateDays = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) { // Gera 7 dias (3 antes e 3 depois da data atual)
      const date = new Date(today);
      date.setDate(today.getDate() + i); // Adiciona/subtrai dias da data atual

      days.push({
        id: i + 4, // Um ID único para cada item
        day: daysOfWeek[date.getDay()], // Nome do dia da semana
        date: date.getDate() // Número do dia do mês
      });
    }
    return days;
  };

  const days = generateDays();

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

  const firstName = user.nome.split(' ')[0];

  const handleTurmaPress = (turma) => {
    setSelectedTurma(turma); // Define a turma selecionada
    setIsModalVisible(true); // Abre o modal
  };

  const closeModal = () => {
    setIsModalVisible(false); // Fecha o modal
    setSelectedTurma(null); // Limpa a turma selecionada
  };

  // Função para renderizar os dias da semana com a lógica de estilo original
  const renderDayItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedDay(item.date)}>
      <View style={{
        padding: 10,
        borderRadius: 5,
        backgroundColor: selectedDay === item.date ? '#1E3A8A' : '#f0f0f0', // Azul para o dia selecionado
        marginHorizontal: 1,
        alignItems: 'center',
        minWidth: 50, // Define a largura mínima para manter o estilo dos blocos
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: selectedDay === item.date ? '#fff' : '#000' }}>
          {item.date}
        </Text>
        <Text style={{ color: selectedDay === item.date ? '#fff' : '#000', fontSize: 10 }}>  
          {item.day}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TurmasCard 
            turma={{
              turmaId: item.$id, // Passa o ID da turma
              title: item.title,
              Qtd_Semana: item.Qtd_Semana,
              Dia1: item.Dia1,
              Dia2: item.Dia2,
              Dia3: item.Dia3,
              Local: item.Local,
              MaxAlunos: item.MaxAlunos,
              Horario_de_inicio: item.Horario_de_inicio,
              Horario_de_termino: item.Horario_de_termino,
            }}
            onPress={() => handleTurmaPress(item)} // Passa a função de clique
          />
        )}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-2">
              <View>
                <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
                <Text className="text-2xl font-psemibold text-verde">{firstName}</Text>
              </View>
              <View className="mt-1.5">
                <Image source={images.escola_sp_transparente} className="w-[115px] h-[90px]" />
              </View>
            </View>

            {/* Lista horizontal de dias da semana */}
            <FlatList
              data={days}
              horizontal
              keyExtractor={item => item.id.toString()}
              renderItem={renderDayItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />

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
              {(user.role == 'admin' || user.role == 'professor') && (
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
              )}
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
              {(user.role == 'admin' || user.role == 'professor') && (
                  <>
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
                {(user.role == 'admin' || user.role == 'professor') && (
                  <CustomButton 
                    title="Encerrar Turma" 
                    containerStyles="ml-10 mr-10 p-4 mt-4 bg-red-700"
                    handlePress={async () => {
                      try {
                        await deletarTurma(selectedTurma.$id); // Chama a função deletarTurma passando o ID da turma
                        closeModal(); // Fecha o modal
                        fetchData();  // Atualiza a lista de turmas
                        Alert.alert('Sucesso', 'Turma encerrada com sucesso!');
                      } catch (error) {
                        Alert.alert('Erro', error.message);
                      }
                    }} 
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

export default Turmas;
