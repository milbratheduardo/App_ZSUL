import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, getEventsConfirmados, updateEventConfirmados } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VerRelacionados = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { eventTitle, eventId } = useLocalSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const confirmadosIds = await getEventsConfirmados(eventId);
      console.log('Confirmados IDs:', confirmadosIds);

      const allAlunos = await getAllAlunos();
      const updatedAlunos = allAlunos.map((aluno) => ({
        ...aluno,
        selected: confirmadosIds.includes(aluno.userId),
      }));

      setAlunos(updatedAlunos);
      setFilteredAlunos(updatedAlunos);
      setConfirmados(confirmadosIds);
    } catch (error) {
      setErrorMessage('Não foi possível carregar os alunos.');
      setShowErrorModal(true);
    }
  };

  const handleSelectAluno = (userId) => {
    if (confirmados.includes(userId)) {
      setConfirmados(confirmados.filter((confirmadoId) => confirmadoId !== userId));
    } else {
      setConfirmados([...confirmados, userId]);
    }

    const updatedAlunos = alunos.map((aluno) =>
      aluno.userId === userId ? { ...aluno, selected: !aluno.selected } : aluno
    );
    setFilteredAlunos(updatedAlunos);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos);
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
    }
  };

  const handleSave = async () => {
    try {
      await updateEventConfirmados(eventId, confirmados);
      setSuccessMessage('Lista atualizada com sucesso!');
      setShowSuccessModal(true);
      router.back();
    } catch (error) {
      setErrorMessage('Não foi possível salvar as alterações.');
      setShowErrorModal(true);
    }
  };

  const isEditable = user?.role === 'admin' || user?.role === 'profissional';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relacionados para {eventTitle}</Text>
      </View>

      <TextInput
        placeholder="Buscar atleta"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      <ScrollView style={styles.alunoList}>
        {filteredAlunos.map((item) => (
          <TouchableOpacity
            key={item.userId}
            disabled={!isEditable}
            style={[
              styles.alunoContainer,
              item.selected && styles.alunoSelecionado,
            ]}
            onPress={() => isEditable && handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>{item.selected ? '✓' : '○'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isEditable && (
        <View style={styles.buttonContainer}>
          <CustomButton
            containerStyles="px-3 py-2 rounded-lg w-[120px] h-[40px] justify-center items-center"
            title="Salvar"
            handlePress={handleSave}
          />
        </View>
      )}

      {/* Modal de Erro */}
      <Modal visible={showErrorModal} transparent={true} animationType="slide" onRequestClose={() => setShowErrorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal visible={showSuccessModal} transparent={true} animationType="slide" onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <MaterialCommunityIcons name="check-circle" size={48} color="white" />
            <Text style={styles.modalTitle}>Sucesso</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSuccessModal(false)}>
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
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alunoList: {
    flex: 1,
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

export default VerRelacionados;
