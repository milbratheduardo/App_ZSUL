import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getTreinosPersonalizados, getAllTreinosPersonalizados, getAlunosById, deleteTreino } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashTreinos = () => {
  const { user } = useGlobalContext();
  const [treinos, setTreinos] = useState([]);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const firstName = user?.nome.split(' ')[0];

  useEffect(() => {
    fetchTreinos();
  }, []);

  const fetchTreinos = async () => {
    try {
      let response;
      if (user.admin === 'admin') {
        response = await getAllTreinosPersonalizados();
      } else {
        response = await getTreinosPersonalizados(user.userId);
      }

      const treinosComNomes = await Promise.all(
        response.map(async (treino) => {
          try {
            const aluno = await getAlunosById(treino.aluno);
            return { ...treino, nomeAluno: aluno.nome };
          } catch (error) {
            setErrorMessage('Erro ao buscar aluno para treino.');
            setShowErrorModal(true);
            return { ...treino, nomeAluno: 'Aluno não encontrado' };
          }
        })
      );

      setTreinos(treinosComNomes);
    } catch (error) {
      setErrorMessage('Erro ao carregar treinos.');
      setShowErrorModal(true);
    }
  };

  const openEditModal = (treino) => {
    Alert.alert('Editar', `Editar treino: ${treino.titulo}`);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTreino(id); // Chama a função deleteTreino
            setTreinos(treinos.filter((t) => t.$id !== id)); // Atualiza a lista local
            setSuccessMessage('Treino excluído com sucesso!');
            setShowSuccessModal(true);
          } catch (error) {
            console.error('Erro ao excluir treino:', error);
            setErrorMessage('Erro ao excluir o treino.');
            setShowErrorModal(true);
          }
        },
      },
    ]);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {firstName}</Text>
        <Text style={styles.subtitle}>Treinos Personalizados</Text>
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
              <Text style={styles.alunoName}>Aluno {item.nomeAluno.split(' ')[0]}</Text>
            </View>
            <Text style={styles.descricao}>{item.descricao}</Text>
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
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleDelete(item.$id)} style={styles.iconButton}>
                <Feather name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
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

export default DashTreinos;

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
    marginTop:10
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
});
