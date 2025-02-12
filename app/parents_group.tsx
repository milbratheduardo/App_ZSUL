import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllTurmas, getAlunosByTurmaId, getAllResponsaveis } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ParentsGroup = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [turmas, setTurmas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let filteredTurmas = [];
  
      const allTurmas = await getAllTurmas();
  
      if (user.admin === 'admin') {
        filteredTurmas = allTurmas; 
      } else if (user.role === 'profissional') {
        filteredTurmas = allTurmas.filter((turma) =>
          turma.profissionalId.includes(user.userId)
        );
      } else if (user.role === 'responsavel') {
        const responsaveis = await getAllResponsaveis();
        const currentResponsavel = responsaveis.find(
          (resp) => resp.userId === user.userId
        );
  
        if (currentResponsavel) {
          const cpf = currentResponsavel.cpf;
          const alunosPromises = allTurmas.map((turma) =>
            getAlunosByTurmaId(turma.$id)
          );
  
          const allAlunos = await Promise.all(alunosPromises);
  
          filteredTurmas = allTurmas.filter((turma, index) =>
            allAlunos[index].some((aluno) => aluno.nomeResponsavel === cpf)
          );
        }
      }
  
      setTurmas(filteredTurmas);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTurma = ({ item }) => (
    <TouchableOpacity
      style={styles.topicContainer}
      onPress={() => router.push({
        pathname: '/mensagens_responsaveis',
        params: { turmaId: item.$id }
      })}
    >
      <Icon name="soccer-ball-o" size={24} color="#126046" style={styles.topicIcon} />
      <View style={styles.topicTextContainer}>
        <Text style={styles.topicTitle}>{item.title}</Text>
        <Text style={styles.topicDescription}>{item.Local}</Text>
      </View>
      <Icon name="angle-right" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Grupo de Responsáveis</Text>
        <Text style={styles.subHeaderText}>Conecte-se com as suas turmas</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#126046" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={turmas}
          renderItem={renderTurma}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
        />
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
    </SafeAreaView>
  );
};

export default ParentsGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  topicContainer: {
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
  topicIcon: {
    marginRight: 16,
  },
  topicTextContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
