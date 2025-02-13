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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 


  const fetchData = async () => {
    setIsLoading(true);
    try {
      let response = [];
  
      if (user.admin === 'admin') {
        // Busca todas as turmas se o usuário for admin
        response = await getAllTurmas();
      } else {
        // Busca e filtra as turmas relacionadas ao profissional
        const allTurmas = await getAllTurmas();
        response = allTurmas.filter(
          turma =>
            turma.profissionalId.includes(user.userId) && // Verifica se o user.userId está contido em turma.profissionalId
            (turma.Dia1 || turma.Dia2 || turma.Dia3) // Filtro para dias disponíveis
        );
      }
  
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
  }, []);

  const handleTurmaPress = (turma) => {
    // Aqui você pode adicionar a ação ao clicar no card da turma, como abrir um modal ou redirecionar
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
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TurmasCard
            turma={{
              turmaId: item.$id,
              title: item.title,
              Qtd_Semana: item.Qtd_Semana,
              Dia1: item.Dia1,
              Dia2: item.Dia2,
              Dia3: item.Dia3,
              Local: item.Local,
              MaxAlunos: item.MaxAlunos,
              Sub: item.Sub,
              Horario_de_inicio: item.Horario_de_inicio,
              Horario_de_termino: item.Horario_de_termino,
            }}
            onPress={() => handleTurmaPress(item)}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '600', color: '#1E3A8A' }}>
       
              </Text>
              {user.role === 'admin' && (
                <CustomButton
                  title="Nova Turma"
                  handlePress={() => router.push('/cadastro_turma')}
                  containerStyles={{ padding: 10, backgroundColor: '#126046', borderRadius: 8 }}
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
  