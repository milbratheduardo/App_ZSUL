import { View, Text, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { images } from '@/constants'; 
import CustomButton from '@/components/CustomButton'; 
import { router } from 'expo-router';
import { getAllEvents } from '@/lib/appwrite'; // Certifique-se de que essa função retorna corretamente os eventos

const Eventos = () => {
  const { user } = useGlobalContext();
  const [events, setEvents] = useState([]); // Estado para armazenar os eventos
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função para converter 'dd-mm-yyyy' para 'yyyy-mm-dd'
  const convertDateToISO = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  // Função para buscar os eventos
  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await getAllEvents(); 
      const formattedEvents = response.map(event => ({
        ...event,
        isoDate: convertDateToISO(event.Date_event), 
      }));
      setEvents(formattedEvents); 
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

  // Mapeia os eventos para o formato esperado pelo calendário
  const markedDates = events.reduce((acc, event) => {
    const date = event.isoDate; // Usa a data convertida
    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: '#A3935E' };
    }
    return acc;
  }, {});

  // Função para lidar com o clique em um dia do calendário
  const handleDayPress = (day) => {
    const date = day.dateString;
    const dayEvents = events.filter(event => event.isoDate === date);

    if (dayEvents.length > 0) {
      const eventDetails = dayEvents
        .map(event => (
          `${event.Title}\n\nData: ${event.Date_event}\n\nDescrição: ${event.Description}\n\nHora: ${event.Hora_event}`
        ))
        .join('\n\n──────────\n\n'); // Linha separadora para múltiplos eventos

      Alert.alert('Eventos', eventDetails);
    } else {
      Alert.alert('Nenhum evento', 'Nenhum evento programado para este dia.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header com saudação e logo */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
            <Text className="text-2xl font-psemibold text-golden">{firstName}</Text>
          </View>
          <Image source={images.logo_zsul} className="w-[115px] h-[35px]" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text className="text-primary text-lg font-pregular mb-1">Eventos</Text>
          {user.role === 'admin' && (
            <CustomButton 
              title="Criar Evento"
              handlePress={() => router.push('/cadastro_eventos')}
              containerStyles="ml-4 p-3"
            />
          )}
        </View>

        {/* Calendário */}
        <Calendar
          markedDates={markedDates} // Marca as datas com eventos
          onDayPress={handleDayPress} // Exibe os detalhes ao clicar
          theme={{
            selectedDayBackgroundColor: '#A3935E',
            todayTextColor: '#A3935E',
            arrowColor: '#A3935E',
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Eventos;
