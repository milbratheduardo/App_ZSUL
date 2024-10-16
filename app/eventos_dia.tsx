import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEventsByDate } from '@/lib/appwrite'; // Certifique-se de que essa função está implementada corretamente
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton'; // Reutiliza o botão
import { useLocalSearchParams } from 'expo-router'; // Para pegar a data passada como parâmetro
import EventCard from '@/components/EventCard'; // Supondo que você tenha um componente de card reutilizável para eventos

const EventosDia = () => {
  const [data, setData] = useState([]); // Estado para armazenar os eventos
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { date } = useLocalSearchParams(); // Usa o expo-router para obter a data passada

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const response = await getEventsByDate(date); // Busca os eventos usando a data como parâmetro
      setData(response);
    } catch (error) {
      Alert.alert('Erro', error.message);
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
    </SafeAreaView>
  );
};

export default EventosDia;
