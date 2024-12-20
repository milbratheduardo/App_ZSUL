import { View, Text, FlatList, Image, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEventsByDate } from '@/lib/appwrite'; // Certifique-se de que essa função está implementada corretamente
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton'; // Reutiliza o botão
import { useLocalSearchParams } from 'expo-router'; // Para pegar a data passada como parâmetro
import EventCard from '@/components/EventCard'; // Supondo que você tenha um componente de card reutilizável para eventos
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EventosDia = () => {
  const [data, setData] = useState([]); // Estado para armazenar os eventos
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
  
  const { date } = useLocalSearchParams(); // Usa o expo-router para obter a data passada

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const response = await getEventsByDate(date); // Busca os eventos usando a data como parâmetro
      setData(response);
    } catch (error) {
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
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
  }, [date]);

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />} // Usando um card personalizado para renderizar os eventos
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-2">
              <View>
                <Text className="font-pmedium text-sm text-primary">Eventos do dia</Text>
                <Text className="text-2xl font-psemibold text-verde">{date}</Text>
              </View>
            </View>
            <View className="w-full flex-row items-center justify-between pt-5 pb-2">
              <Text className="text-primary text-lg font-pregular mb-1">
                Eventos Disponíveis
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhum Evento Encontrado"
            subtitle="Não há eventos para esta data."
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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

export default EventosDia;
