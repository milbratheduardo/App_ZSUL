import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { getTreinosPersonalizadosByAlunoId, getAlunosById, getAllProfissionais } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashTreinos2 = () => {
  const { alunoId } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const [treinos, setTreinos] = useState([]);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [atletaNome, setAtletaNome] = useState('');
  const [profissionais, setProfissionais] = useState([]);
  const firstName = user?.nome.split(' ')[0];

  useEffect(() => {
    fetchAlunoNome();
    fetchTreinos();
    fetchProfissionais();
  }, [alunoId]);

  const fetchAlunoNome = async () => {
    try {
      const idAluno = alunoId && alunoId !== '' ? alunoId : user.userId;
      if (!idAluno) {
        setErrorMessage('Erro, aluno não identificado.');
        setShowErrorModal(true);
        return;
      }
      const aluno = await getAlunosById(idAluno);
      setAtletaNome(aluno.nome);
    } catch (error) {
      setErrorMessage('Não foi possível carregar o nome do aluno.');
      setShowErrorModal(true);
    }
  };

  const fetchTreinos = async () => {
    try {
      const idAluno = alunoId && alunoId !== '' ? alunoId : user.userId;
      if (!idAluno) {
        setErrorMessage('Erro, aluno não identificado.');
        setShowErrorModal(true);
        return;
      }
      const response = await getTreinosPersonalizadosByAlunoId(idAluno);
      setTreinos(response);
    } catch (error) {
      setErrorMessage('Não foi possível carregar os treinos.');
      setShowErrorModal(true);
    }
  };

  const fetchProfissionais = async () => {
    try {
      const response = await getAllProfissionais();
      setProfissionais(response);
    } catch (error) {
      setErrorMessage('Não foi possível carregar os profissionais.');
      setShowErrorModal(true);
    }
  };

  const getProfessorNome = (professorId) => {
    const professor = profissionais.find((prof) => prof.userId === professorId);
    return professor ? professor.nome : 'Desconhecido';
  };

  const deleteTreino = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          setTreinos(treinos.filter((t) => t.$id !== id));
          setSuccessMessage('Treino excluído com sucesso!');
          setShowSuccessModal(true);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {firstName}</Text>
        {user.role === 'atleta' ? (
          <Text style={styles.subtitle}>Meus Treinos Personalizados</Text>
        ) : (
          <Text style={styles.subtitle}>Treinos Personalizados do {atletaNome}</Text>
        )}
      </View>


      <FlatList
        data={treinos}
        keyExtractor={(item) => item.$id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.treinoContainer, selectedTreino?.$id === item.$id && styles.treinoSelecionado]}
            onPress={() => setSelectedTreino(item)}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.treinoTitle}>{item.titulo}</Text>
              <Text style={styles.alunoName}>{user.role === 'admin' ? item.alunoNome : ''}</Text>
            </View>
            <Text style={styles.descricao}>{item.descricao}</Text>
            <Text style={styles.professorName}>Professor: {getProfessorNome(item.professor)}</Text>
            {item.link && (
              <Text
                style={styles.videoLink}
                onPress={() => {
                  const url = item.link.startsWith('http') ? item.link : `https://${item.link}`;
                  Linking.openURL(url);
                }}
              >
                Assistir Vídeo
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum treino encontrado para este aluno.</Text>
          </View>
        }
      />

      {/* Modal de Erro */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentError}>
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
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSuccess}>
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

export default DashTreinos2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  treinoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  treinoSelecionado: {
    borderColor: '#126046',
    borderWidth: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treinoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  alunoName: {
    fontSize: 14,
    color: '#888888',
  },
  descricao: {
    fontSize: 14,
    color: '#555555',
    marginTop: 8,
  },
  professorName: {
    fontSize: 14,
    color: 'black',
    marginTop: 8,
  },
  videoLink: {
    color: '#126046',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  cardActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentError: {
    backgroundColor: '#ff4d4f',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalContentSuccess: {
    backgroundColor: '#4CAF50',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 12,
  },
  closeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
