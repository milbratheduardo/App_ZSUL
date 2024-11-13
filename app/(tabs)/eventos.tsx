import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { images } from '@/constants'; 
import CustomButton from '@/components/CustomButton'; 
import { router } from 'expo-router';
import { getAllEvents } from '@/lib/appwrite'; 
import { AntDesign, Feather } from '@expo/vector-icons';// Certifique-se de que essa função retorna corretamente os eventos

// Configurar o calendário para Português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

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

  const firstName = user?.nome.split(' ')[0];

  // Mapeia os eventos para o formato esperado pelo calendário
  const markedDates = events.reduce((acc, event) => {
    const date = event.isoDate; // Usa a data convertida
    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: '#D30A0C' };
    }
    return acc;
  }, {});

  const convertDateToDMY = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getTodayLocalDate();
  
  markedDates[today] = {
    selected: true,
    selectedColor: '#126046', // Definindo o dia atual em verde
    selectedTextColor: 'white',
  };


  

  // Função para lidar com o clique em um dia do calendário
  const handleDayPress = (day) => {
    const date = convertDateToDMY(day.dateString);
    router.push({
      pathname: '/eventos_dia',
      params: { date },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header com saudação e logo */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
            <Text className="text-2xl font-psemibold text-verde">{firstName}</Text>
          </View>
          <Image source={images.escola_sp_transparente} className="w-[115px] h-[90px]" />
        </View>
      </View>
      {user.role === 'admin' || user.role === 'profissional' && (
      <View style={{ position: 'absolute', bottom: 80, right: 30 }}>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/cadastro_eventos',
          })}
          style={{
            backgroundColor: '#126046',
            borderRadius: 50,
            padding: 20,
            elevation: 5,
          }}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
      )}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text className="text-primary text-lg font-pregular mb-1">Eventos</Text>
        </View>

        {/* Calendário */}
        <Calendar
          markedDates={markedDates} // Marca as datas com eventos
          onDayPress={handleDayPress} // Redireciona para a tela eventos_dia ao clicar no dia
          theme={{
            todayTextColor: '#126046', // Verde para o dia atual
            arrowColor: '#126046', // Verde para as setas
            selectedDayBackgroundColor: '#126046', // Verde para o dia selecionado
            selectedDayTextColor: 'white', // Cor do texto do dia selecionado
            dotColor: '#D30A0C', // Cor vermelha para os eventos
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Eventos;
