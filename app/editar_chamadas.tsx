import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getChamadasByTurmaId, getAlunosById, getTurmaById, updateChamada } from '@/lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EditarChamadas = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [presentes, setPresentes] = useState([]);
  const [ausentes, setAusentes] = useState([]);
  const [turma, setTurma] = useState(null); // Para armazenar os dados da turma
  const { turmaId, chamadaId } = useLocalSearchParams(); // Pegue o ID da turma e da chamada da rota
  const [chamada, setChamada] = useState(null); // Para armazenar a chamada selecionada
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    fetchChamada();
    fetchTurma(); // Chama a função para buscar a turma
  }, []);

  const fetchChamada = async () => {
    try {
      const chamadas = await getChamadasByTurmaId(turmaId);
      const chamadaSelecionada = chamadas.find((chamada) => chamada.$id === chamadaId);
      if (chamadaSelecionada) {
        setChamada(chamadaSelecionada);
        await fetchAlunos(chamadaSelecionada.presentes, chamadaSelecionada.ausentes);
      }
    } catch (error) {
      setErrorMessage(`Erro ao carregar a chamada.`);
      setShowErrorModal(true);
    }
  };

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData); // Armazena os dados da turma
    } catch (error) {
      setErrorMessage(`Erro ao buscar turma.`);
      setShowErrorModal(true);
    }
  };

  const fetchAlunos = async (presentesIds, ausentesIds) => {
    try {
      const presentesAlunos = await Promise.all(
        presentesIds.map(async (userId) => {
          const aluno = await getAlunosById(userId);
          return aluno;
        })
      );

      const ausentesAlunos = await Promise.all(
        ausentesIds.map(async (userId) => {
          const aluno = await getAlunosById(userId);
          return aluno;
        })
      );

      const allAlunos = [...presentesAlunos, ...ausentesAlunos];
      setAlunos(allAlunos);
      setFilteredAlunos(allAlunos.slice(0, 10));
      setPresentes(presentesIds);
      setAusentes(ausentesIds);
    } catch (error) {
      setErrorMessage(`Erro ao carregar alunos.`);
      setShowErrorModal(true);
    }
  };

  const handleSelectAluno = (userId) => {
    if (presentes.includes(userId)) {
      setPresentes(presentes.filter((presentId) => presentId !== userId));
      setAusentes([...ausentes, userId]);
    } else if (ausentes.includes(userId)) {
      setAusentes(ausentes.filter((ausenteId) => ausenteId !== userId));
      setPresentes([...presentes, userId]);
    }
  };

  const handleSave = async () => {
    try {
      await updateChamada(chamadaId, { presentes, ausentes });
      setSuccessMessage('Chamada atualizada com sucesso!');
      setShowSuccessModal(true);
      router.back();
    } catch (error) {
      setErrorMessage(`Erro ao salvar as alterações.`);
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {chamada && turma && (
          <Text style={styles.title}>Chamada do Dia {chamada.data} da {turma.title}</Text>
        )}
      </View>

      <Text style={styles.subtitle}>Selecione apenas os presentes</Text>

      <FlatList
        data={alunos}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alunoContainer,
              presentes.includes(item.userId) && styles.alunoSelecionado,
            ]}
            onPress={() => handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>{presentes.includes(item.userId) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyles="rounded-lg w-[180px] h-[40px]"
          title="Salvar Alterações"
          handlePress={handleSave}
        />
      </View>
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
              <View style={styles.modalOverlay}>
                <View style={styles.successModal}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="white" />
                  <Text style={styles.modalTitle}>Sucesso</Text>
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  alunoSelecionado: {
    backgroundColor: '#d0f0d0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#126046',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  modalOverlay: {
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
  modalTitle: {
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

export default EditarChamadas;
