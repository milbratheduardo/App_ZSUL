import { View, Text, Image, Alert, TouchableOpacity, ScrollView, RefreshControl, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { images } from '@/constants'; 
import { router } from 'expo-router';
import { getAllEvents } from '@/lib/appwrite'; 
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Função para converter 'dd-mm-yyyy' para 'yyyy-mm-dd'
  const convertDateToISO = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  // Função para buscar os eventos
  const fetchData = async () => {
    try {
      const response = await getAllEvents();
      const formattedEvents = response.map(event => ({
        ...event,
        isoDate: convertDateToISO(event.Date_event),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
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
    const date = event.isoDate;
    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: '#D30A0C' };
    }
    return acc;
  }, {});

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
    selectedColor: '#126046',
    selectedTextColor: 'white',
  };

  const handleDayPress = (day) => {
    const [year, month, dayNumber] = day.dateString.split('-');
    const formattedDate = `${dayNumber}-${month}-${year}`;
    router.push({
      pathname: '/eventos_dia',
      params: { date: formattedDate },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
              onPress={() => router.push({ pathname: '/cadastro_eventos' })}
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
          <Text className="text-primary text-lg font-pregular mb-1">Eventos</Text>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: '#126046',
              arrowColor: '#126046',
              selectedDayBackgroundColor: '#126046',
              selectedDayTextColor: 'white',
              dotColor: '#D30A0C',
            }}
          />
        </View>
      </ScrollView>
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

export default Eventos;
