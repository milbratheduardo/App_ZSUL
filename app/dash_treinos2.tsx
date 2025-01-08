import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router'; // Importar o hook
import { getTreinosPersonalizadosByAlunoId } from '@/lib/appwrite'; // Substitua pelo caminho real
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DashTreinos2 = () => {
  const { alunoId } = useLocalSearchParams(); 
  const [treinos, setTreinos] = useState([]);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const { user } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTreinos();
  }, [alunoId]);

  const fetchTreinos = async () => {
    try {
      const idAluno = alunoId && alunoId !== '' ? alunoId : user.userId; // Usa alunoId se não for vazio, senão usa user.userId
  
      if (!idAluno) {
        setErrorMessage(`Erro, aluno não identificado.`);
        setShowErrorModal(true);
        return;
      }
  
      // Obter treinos personalizados do aluno pelo idAluno
      const response = await getTreinosPersonalizadosByAlunoId(idAluno);
      setTreinos(response);
    } catch (error) {
      setErrorMessage(`Não foi possivel carregar os treinos.`);
      setShowErrorModal(true);
      
    }
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
    <View style={styles.container}>
      <Text style={styles.title}>Treinos Personalizados</Text>
      <FlatList
        data={treinos}
        keyExtractor={(item) => item.$id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.treinoContainer,
              selectedTreino?.$id === item.$id && styles.treinoSelecionado,
            ]}
          >
            <Text style={styles.treinoText}>{item.titulo}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
            {item.link && (
              <Text
                style={styles.videoLink}
                onPress={() => Linking.openURL(item.link)}
              >
                Assistir Vídeo
              </Text>
            )}
            <View style={styles.cardActions}>
              {user.role !== 'atleta' || user.role !== 'responsavel' && (
                <TouchableOpacity onPress={() => deleteTreino(item.$id)}>
                  <Feather name="trash" size={20} color="red" style={styles.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum treino encontrado para este aluno.</Text>
          </View>
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
    </View>
  );
};

export default DashTreinos2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  treinoContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },
  treinoSelecionado: {
    backgroundColor: '#d0f0d0',
  },
  treinoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  videoLink: {
    color: '#126046',
    textAlign: 'center',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  checkmarkTreino: {
    fontSize: 24,
    color: '#126046',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardActions: {
    position: 'absolute',
    top: 10, // Posiciona no topo
    right: -40, // Posiciona à direita
    borderRadius: 0, // Faz o botão ser crcula
    padding: 50,
  },
  icon: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
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
