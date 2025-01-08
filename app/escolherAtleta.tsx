import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { getAllAlunos, salvarChamada, getTurmaById, addAlunoToTurma, getUsersById } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EscolherAtleta = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [turma, setTurma] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  // Capturando os parâmetros position e turmaId
  const { turmaId, turmaTitle, position } = useLocalSearchParams();

 

  useEffect(() => {
    fetchAlunos();
    fetchTurma();
  }, [turmaId, position]);

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
    } catch (error) {
      setErrorMessage(`Erro ao buscar turma.`);
      setShowErrorModal(true);
    }
  };


  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      const alunosFiltrados = [];
  
      // Iterar sobre cada aluno
      for (const aluno of alunosData) {
        try {
          // Buscar informações do usuário pelo userId
          const userAtleta = await getUsersById(aluno.userId);
          if (userAtleta.status !== 'Arquivado' && 
              (!aluno.turmaId || aluno.turmaId === '') && 
              (position === "qualquer" || aluno.posicao === position)) {
            alunosFiltrados.push(aluno);
          }
        } catch (error) {
         
        }
      }
  
      setAlunos(alunosFiltrados);
      setFilteredAlunos(alunosFiltrados.slice(0, 10)); // Exibir os primeiros 10 alunos
    } catch (error) {
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
    }
  };
  

  const handleSelectAluno = (userId) => {
    if (selectedAlunos.includes(userId)) {
      setSelectedAlunos(selectedAlunos.filter((selectedId) => selectedId !== userId));
    } else {
      setSelectedAlunos([...selectedAlunos, userId]);
    }
  };

  const handleSave = async () => {
    try {
      // Para cada aluno selecionado, chame addAlunoToTurma com o userId e turmaId
      for (const userId of selectedAlunos) {
        await addAlunoToTurma(userId, turmaId);
      }
      
      setSuccessMessage('Alunos cadastrados com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
    
      setErrorMessage(`Não foi possível cadastrar os alunos.`);
      setShowErrorModal(true);
    }
  };
  


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolher Atleta para a Posição: {position}</Text>
      </View>

      {turma ? (
        <TurmasCard2
          turma={{
            turmaId: turma.$id,
            title: turma.title,
            Horario_de_inicio: turma.Horario_de_inicio,
            Horario_de_termino: turma.Horario_de_termino,
            Local: turma.Local,
            Dia1: turma.Dia1,
            Dia2: turma.Dia2,
            Dia3: turma.Dia3,
            MaxAlunos: turma.MaxAlunos,
          }}
        />
      ) : (
        <Text>Carregando informações da turma...</Text>
      )}

      <Text style={styles.subtitle}>Selecione os Atletas</Text>

      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alunoContainer,
              selectedAlunos.includes(item.userId) && styles.alunoSelecionado,
            ]}
            onPress={() => handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>
              {selectedAlunos.includes(item.userId) ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyles="rounded-lg w-[180px] h-[40px]"
          title="Registrar"
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
  datePicker: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerText: {
    color: '#333',
    fontSize: 16,
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

export default EscolherAtleta;
