import { View, Text, FlatList, Alert, Modal, RefreshControl, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChamadasByTurmaId, getAlunosById, deleteChamadaById, getTurmaById } from '@/lib/appwrite';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VerChamadas = () => {
  const [chamadas, setChamadas] = useState([]);
  const [filteredChamadas, setFilteredChamadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedChamada, setSelectedChamada] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [presentesNomes, setPresentesNomes] = useState([]);
  const [ausentesNomes, setAusentesNomes] = useState([]);
  const [turma, setTurma] = useState(null);
  const { user } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const { turmaId, turmaTitle } = useLocalSearchParams();

  const fetchChamadas = async () => {
    setIsLoading(true);
    try {
      const response = await getChamadasByTurmaId(turmaId);
      const reversedResponse = response.reverse(); // Apenas uma reversão
      setChamadas(reversedResponse);
      setFilteredChamadas(reversedResponse);
    } catch (error) {
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateToBR = (dateString) => {
    const months = [
      '01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'
    ];
  
    const [year, month, day] = dateString.split('-'); // Divida a data no formato "yyyy-mm-dd"
    const monthName = months[parseInt(month, 10) - 1]; // Converta o mês para o nome
    return `${day}-${monthName}-${year}`; // Retorne no formato "dd-mês-ano"
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChamadas();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchChamadas();
  }, [turmaId]);

  useEffect(() => {
    const fetchTurma = async () => {
      try {
        const turmaData = await getTurmaById(turmaId);
        setTurma(turmaData);
      } catch (error) {
      
      }
    };
    fetchTurma();
  }, [turmaId]);

  const fetchAlunosNomes = async (alunosUserIds, setAlunosNomes) => {
    try {
      const nomes = await Promise.all(
        alunosUserIds.map(async (userId) => {
          const alunoData = await getAlunosById(userId);
          return alunoData.nome;
        })
      );
      setAlunosNomes(nomes);
    } catch (error) {
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
    }
  };

  const handleDeleteChamada = async (chamadaId) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir esta chamada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await deleteChamadaById(chamadaId);
            fetchChamadas();
            setSuccessMessage('Chamada excluída com sucesso!');
            setShowSuccessModal(true);
          } catch (error) {
            setErrorMessage(`Não foi possível excluir a chamada.`);
            setShowErrorModal(true);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleChamadaPress = (chamada) => {
    setSelectedChamada(chamada);
    setIsModalVisible(true);
    fetchAlunosNomes(chamada.presentes, setPresentesNomes);
    fetchAlunosNomes(chamada.ausentes, setAusentesNomes);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedChamada(null);
    setPresentesNomes([]);
    setAusentesNomes([]);
  };

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = chamadas.filter((chamada) => chamada.data.includes(text));
    setFilteredChamadas(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
    data={filteredChamadas}
    keyExtractor={(item) => item.$id}
    renderItem={({ item }) => (
      <View style={styles.chamadaCard}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleChamadaPress(item)}>
          <View>
            {/* Formata a data usando a função formatDateToBR */}
            <Text style={styles.chamadaData}>{formatDateToBR(item.data)}</Text>
            <Text style={styles.chamadaText}>Presentes: {item.presentes.length}</Text>
            <Text style={styles.chamadaText}>Ausentes: {item.ausentes.length}</Text>
          </View>
        </TouchableOpacity>

        {(user.role === 'admin' || user.role === 'professor') && (
          <TouchableOpacity onPress={() => handleDeleteChamada(item.$id)} style={styles.deleteButton}>
            <AntDesign name="delete" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.header}>
          
            {turma && (
              <TurmasCard2
                turma={{
                  turmaId: turma.$id,
                  title: turma.title,
                  Qtd_Semana: turma.Qtd_Semana,
                  Dia1: turma.Dia1,
                  Dia2: turma.Dia2,
                  Dia3: turma.Dia3,
                  Local: turma.Local,
                  MaxAlunos: turma.MaxAlunos,
                  Horario_de_inicio: turma.Horario_de_inicio,
                  Horario_de_termino: turma.Horario_de_termino,
                }}
              />
            )}
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="Nenhuma Chamada Encontrada" subtitle="Não há chamadas registradas para esta turma" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

<View style={styles.searchContainer}>
  <TouchableOpacity onPress={handleSearchToggle} style={styles.searchButton}>
    <Feather name="search" size={12} color="white" />
  </TouchableOpacity>
  {searchVisible && (
    <TextInput
      placeholder="Pesquisar por data (dd-mm-yyyy)"
      value={searchText}
      onChangeText={(text) => {
        const formattedText = text
          .replace(/[^0-9-]/g, '') // Permite apenas números e hífens
          .replace(/^(\d{2})(\d)/, '$1-$2') // Insere o primeiro hífen após o dia
          .replace(/-(\d{2})(\d)/, '-$1-$2') // Insere o segundo hífen após o mês
          .slice(0, 10); // Limita o comprimento a 10 caracteres
        setSearchText(formattedText); // Atualiza o estado com o texto formatado
        handleSearch(formattedText); // Realiza a busca com o texto formatado
      }}
      style={styles.searchInput}
      keyboardType="default" // Permite caracteres e símbolos, incluindo hífen
    />
  )}
</View>



      <View style={styles.addButtonContainer}>
        {(user.role === 'admin' || user.role === 'profissional') && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/turma_chamadas', params: { turmaId, turmaTitle } })}
            style={styles.addButton}
          >
            <AntDesign name="plus" size={12} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {selectedChamada && (
        <Modal transparent={true} visible={isModalVisible} onRequestClose={closeModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chamada do dia {selectedChamada.data}</Text>

              {/* Adicionando ScrollView para permitir rolagem de conteúdo */}
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSubtitle}>Presentes:</Text>
                  {presentesNomes.length > 0 ? (
                    presentesNomes.map((nome, index) => (
                      <View key={index} style={styles.modalItem}>
                        <AntDesign name="checkcircle" size={14} color="green" style={styles.icon} />
                        <Text style={styles.modalText}>{nome}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.modalEmptyText}>Nenhum presente registrado.</Text>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSubtitle}>Ausentes:</Text>
                  {ausentesNomes.length > 0 ? (
                    ausentesNomes.map((nome, index) => (
                      <View key={index} style={styles.modalItem}>
                        <AntDesign name="closecircle" size={14} color="red" style={styles.icon} />
                        <Text style={styles.modalText}>{nome}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.modalEmptyText}>Nenhum ausente registrado.</Text>
                  )}
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                {(user.role === 'admin' || user.role === 'profissional') && (
                  <CustomButton
                    title="Editar Chamada"
                    handlePress={() => {
                      router.push({
                        pathname: '/editar_chamadas',
                        params: { turmaId, chamadaId: selectedChamada.$id },
                      });
                      closeModal(); // Fecha o modal logo após o redirecionamento
                    }}
                    containerStyles="rounded-lg w-[180px] h-[40px] mt-5"
                  />
                )}
                <CustomButton title="Fechar" containerStyles="rounded-lg w-[180px] h-[40px] mt-5" handlePress={closeModal} />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
              <Modal
              visible={showSuccessModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSuccessModal(false)}
            >
              <View style={styles.modalOverlay2}>
                <View style={styles.successModal}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="white" />
                  <Text style={styles.modalTitle2}>Sucesso</Text>
                  <Text style={styles.modalMessage}>{successMessage}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowSuccessModal(false);
                      
                    }}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSection: {
    width: '100%',
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginTop: 4,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalButton: {
    width: '80%',
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    alignItems: 'center', // Centraliza horizontalmente
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 12,
  },
  chamadaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 5,
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  chamadaData: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  chamadaText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 63,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#006400',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  searchInput: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    elevation: 5,
    marginRight: 10,
    width: 230,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 30,
  },
  addButton: {
    backgroundColor: '#006400',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  modalOverlay2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
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
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle2: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default VerChamadas;
