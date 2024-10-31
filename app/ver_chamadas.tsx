import { View, Text, FlatList, Alert, Modal, RefreshControl, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChamadasByTurmaId, getAlunosById, deleteChamadaById } from '@/lib/appwrite';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';

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
  const { user } = useGlobalContext();

  const { turmaId, turmaTitle } = useLocalSearchParams();

  const fetchChamadas = async () => {
    setIsLoading(true);
    try {
      const response = await getChamadasByTurmaId(turmaId);
      setChamadas(response.reverse());
      setFilteredChamadas(response.reverse());
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChamadas();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchChamadas();
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
      Alert.alert('Erro', 'Não foi possível carregar os nomes dos alunos');
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
            Alert.alert("Sucesso", "Chamada excluída com sucesso!");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a chamada.");
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

  const exportToPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);

      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      page.drawText(`Chamada do dia: ${selectedChamada.data}`, {
        x: 50,
        y: height - 50,
        size: 18,
        font,
        color: rgb(0.1, 0.2, 0.5),
      });

      page.drawText("Presentes:", { x: 50, y: height - 80, size: 14, font, color: rgb(0, 0, 0) });
      presentesNomes.forEach((nome, index) => {
        page.drawText(`- ${nome}`, { x: 70, y: height - 100 - index * 20, size: fontSize, font });
      });

      page.drawText("Ausentes:", { x: 50, y: height - 120 - presentesNomes.length * 20, size: 14, font, color: rgb(0, 0, 0) });
      ausentesNomes.forEach((nome, index) => {
        page.drawText(`- ${nome}`, {
          x: 70,
          y: height - 140 - presentesNomes.length * 20 - index * 20,
          size: fontSize,
          font,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const filePath = `${FileSystem.documentDirectory}chamada-${selectedChamada.data}.pdf`;

      await FileSystem.writeAsStringAsync(filePath, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(filePath);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      Alert.alert('Erro', 'Não foi possível exportar o PDF');
    }
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
                <Text style={styles.chamadaData}>{item.data}</Text>
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
            <Text style={styles.title}>Registro de Chamadas</Text>
            <TurmasCard2
              turma={{
                turmaId,
                title: turmaTitle,
                Horario_de_inicio: '08:00',
                Horario_de_termino: '10:00',
                Local: 'Campo de Treinamento',
                Dia1: 'Segunda-feira',
                Dia2: 'Quarta-feira',
                Dia3: 'Sexta-feira',
                MaxAlunos: 20,
              }}
            />
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="Nenhuma Chamada Encontrada" subtitle="Não há chamadas registradas para esta turma" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handleSearchToggle} style={styles.searchButton}>
          <Feather name="search" size={24} color="white" />
        </TouchableOpacity>
        {searchVisible && (
          <TextInput
            placeholder="Pesquisar por data (dd-mm-yyyy)"
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        )}
      </View>

      <View style={styles.addButtonContainer}>
        {(user.role === 'admin' || user.role === 'profissional') && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/turma_chamadas', params: { turmaId, turmaTitle } })}
            style={styles.addButton}
          >
            <AntDesign name="plus" size={24} color="white" />
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
                <CustomButton title="Exportar para PDF" handlePress={exportToPdf} containerStyles="rounded-lg w-[180px] h-[40px] mt-5" />
                {(user.role === 'admin' || user.role === 'profissional') && (
                  <CustomButton title="Editar Chamada" handlePress={() => router.push({ pathname: '/editar_chamadas', params: { turmaId, chamadaId: selectedChamada.$id } })} containerStyles="rounded-lg w-[180px] h-[40px] mt-5" />
                )}
                <CustomButton title="Fechar" containerStyles="rounded-lg w-[180px] h-[40px] mt-5" handlePress={closeModal} />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 20,
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
    bottom: 30,
    right: 30,
  },
  addButton: {
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 20,
    elevation: 5,
  },
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
      alignItems: 'center',
    },
    modalSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 4,
      textAlign: 'center',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    icon: {
      marginRight: 8,
    },
    modalText: {
      fontSize: 14,
      color: '#666',
    },
    modalEmptyText: {
      fontSize: 14,
      color: '#999',
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 4,
    },
    buttonContainer: {
      alignItems: 'center',
      marginTop: 15,
    },
  });

export default VerChamadas;
