import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getAllEvents } from '@/lib/appwrite'; // Certifique-se de que estas funções estão implementadas corretamente
import { AntDesign } from '@expo/vector-icons';
import EmptyState from '@/components/EmptyState';
import EventCard from '@/components/EventCard';

const ListarEventos = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // Para armazenar o mês selecionado
  const { date } = useLocalSearchParams(); // Para filtrar eventos por data, se necessário

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEvents(); // Busca todos os eventos
      setEvents(response);
      applyFilters(response, selectedMonth, date); // Aplica os filtros iniciais
    } catch (error) {
      Alert.alert('Erro ao carregar eventos', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (events, month = '', date = '') => {
    let filtered = events;

    if (month) {
      const monthIndex = months.indexOf(month) + 1; // Obtém o índice do mês selecionado
      const formattedMonth = String(monthIndex).padStart(2, '0'); // Garante que o mês tenha 2 dígitos
      filtered = filtered.filter((event) => event.Date_event.split('-')[1] === formattedMonth);
    }

    if (date) {
      filtered = filtered.filter((event) => event.Date_event === date);
    }

    setFilteredEvents(filtered);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    applyFilters(events, month, date);
  };

  const clearFilters = () => {
    setSelectedMonth('');
    applyFilters(events, '', date);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const renderItem = ({ item }) => (
    <EventCard event={item} /> // Exibe cada evento usando o componente de card
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Eventos</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={months}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthButton,
                selectedMonth === item && styles.selectedMonthButton,
              ]}
              onPress={() => handleMonthSelect(item)}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === item && styles.selectedMonthText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.monthList}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#126046" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.subHeaderText}>
                {selectedMonth
                  ? `Eventos para ${selectedMonth}`
                  : date
                  ? `Eventos para ${date}`
                  : 'Todos os Eventos'}
              </Text>
              {(selectedMonth || date) && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearFilterButton}
                >
                  <Text style={styles.clearFilterText}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="Nenhum Evento Encontrado"
              subtitle={
                selectedMonth || date
                  ? 'Não há eventos para este período.'
                  : 'Não há eventos cadastrados.'
              }
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/cadastro_eventos')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ListarEventos;

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#126046',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  monthList: {
    paddingHorizontal: 8,
  },
  monthButton: {
    padding: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedMonthButton: {
    backgroundColor: '#126046',
    borderColor: '#126046',
  },
  monthText: {
    fontSize: 14,
    color: '#555',
  },
  selectedMonthText: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listHeader: {
    marginVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
  },
  clearFilterButton: {
    backgroundColor: '#D30A0C',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 20,
    elevation: 5,
  },
});
