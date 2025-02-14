import { View, Text, FlatList, Alert, TouchableOpacity, Modal, RefreshControl,StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTurmas } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';
import EmptyState from '@/components/EmptyState';
import TurmasCard from '@/components/TurmaCard';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

    
const TurmasList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableLocals, setAvailableLocals] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      let response = [];
      if (user.admin === 'admin') {
        response = await getAllTurmas();
      } else {
        const allTurmas = await getAllTurmas();
        response = allTurmas.filter(
          turma =>
            turma.profissionalId.includes(user.userId) &&
            (turma.Dia1 || turma.Dia2 || turma.Dia3)
        );
      }
      setData(response);
      setFilteredData(response);
      extractFilters(response);
    } catch (error) {
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const extractFilters = (turmas) => {
    const locals = [...new Set(turmas.map((turma) => turma.Local).filter(Boolean))];
    const days = [...new Set(
      turmas.flatMap((turma) => [turma.Dia1, turma.Dia2, turma.Dia3]).filter(Boolean)
    )];
    setAvailableLocals(locals);
    setAvailableDays(days);
  };

  const applyFilters = () => {
    let filtered = data;
    if (selectedLocal) {
      filtered = filtered.filter((turma) => turma.Local === selectedLocal);
    }
    if (selectedDay) {
      filtered = filtered.filter((turma) =>
        [turma.Dia1, turma.Dia2, turma.Dia3].includes(selectedDay)
      );
    }
    setFilteredData(filtered);
    setShowFilterModal(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleLocalFilter = (local) => {
    setSelectedLocal((prevLocal) => (prevLocal === local ? null : local));
  };
  
  const toggleDayFilter = (day) => {
    setSelectedDay((prevDay) => (prevDay === day ? null : day));
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
              <Text style={styles.userInfo}>Todas as Turmas Disponíveis</Text>
            </View>
          </View>
          <Icon name="shield" size={50} color="#126046" style={styles.teamLogo} />
        </View>
      </View>
      <TouchableOpacity style={styles.editButton2} onPress={() => setShowFilterModal(true)}>
        <Icon name="filter" size={18} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Filtros</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TurmasCard turma={{
            turmaId: item.$id,
            title: item.title,
            Qtd_Semana: item.Qtd_Semana,
            Dia1: item.Dia1,
            Dia2: item.Dia2,
            Dia3: item.Dia3,
            Local: item.Local,
            Sub: item.Sub,
            MaxAlunos: item.MaxAlunos,
            Horario_de_inicio: item.Horario_de_inicio,
            Horario_de_termino: item.Horario_de_termino,
          }} />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <EmptyState title="Nenhuma Turma Encontrada" subtitle="Não foi criada nenhuma turma" />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal visible={showFilterModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Turmas</Text>
            <Text style={styles.filterLabel}>Local:</Text>
              {availableLocals.map((local) => (
                <TouchableOpacity key={local} onPress={() => toggleLocalFilter(local)}>
                  <Text style={[
                    styles.filterOption,
                    selectedLocal === local && styles.selectedOption
                  ]}>
                    {local}
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.filterLabel}>Dia da Semana:</Text>
              {availableDays.map((day) => (
                <TouchableOpacity key={day} onPress={() => toggleDayFilter(day)}>
                  <Text style={[
                    styles.filterOption,
                    selectedDay === day && styles.selectedOption
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            <CustomButton title="Aplicar Filtros" containerStyles="mt-5 pt-2 pb-2" handlePress={applyFilters} />
          </View>
        </View>
      </Modal>
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

export default TurmasList;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    editButton2: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop:20,
      marginBottom: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'blue', // Verde escuro
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      width: 300,
      marginLeft: 30
    },
     modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign:"center"
  },
  filterLabel: {
    fontSize: 16,
    marginVertical: 8,
  },
  filterOption: {
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#126046',
    color: '#fff',
  },
    editButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    }, 
    header: {
      padding: 20,
      backgroundColor: '#126046',
      borderBottomWidth: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profileDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
    },
    headerText: {
      justifyContent: 'center',
    },
    greeting: {
      fontSize: 22,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    userInfo: {
      fontSize: 14,
      color: '#D1FAE5',
      marginTop: 4,
    },
    teamLogo: {
      marginLeft: 16,
    },
    optionsList: {
      padding: 16,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionIcon: {
      marginRight: 16,
      color: '#126046',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    arrowIcon: {
      color: '#126046',
    },
  });
  