import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getNovidades, salvarNovidade, deleteNovidade } from '@/lib/appwrite'; // Substitua pelas funções do Appwrite
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Novidades = () => {
  const { user } = useGlobalContext(); // user contém informações como `role`
  const [novidades, setNovidades] = useState([]);
  const [novaNovidade, setNovaNovidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = user.admin === 'admin'; 

  useEffect(() => {
    const fetchNovidades = async () => {
      try {
        const data = await getNovidades();
        setNovidades(data);
      } catch (error) {
        setErrorMessage(`Não foi possível carregar as notícias.`);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNovidades();
  }, []);

  const handleAddNovidade = async () => {
    if (!novaNovidade.trim()) {
      setErrorMessage(`O campo de novidade não pode estar vazio.`);
      setShowErrorModal(true);
      return;
    }
  
    // Dados a serem enviados
    const novidadeData = {
      novidade: novaNovidade, // Texto da novidade
      userId: user?.userId || 'Desconhecido', // Adiciona o ID do usuário ou um valor padrão
    };
  
    try {
      const newNovidade = await salvarNovidade(novidadeData);
      setNovidades((prev) => [...prev, newNovidade]); // Atualiza a lista de novidades
      setNovaNovidade(''); // Limpa o campo de entrada
    } catch (error) {
      setErrorMessage(`Não foi possível salvar a notícia.`);
      setShowErrorModal(true);
    }
  };
  

  const handleDeleteNovidade = async (id) => {
    try {
      await deleteNovidade(id);
      setNovidades(novidades.filter((item) => item.$id !== id));
    } catch (error) {
      setErrorMessage(`Não foi possível deletar a notícia.`);
      setShowErrorModal(true);
    }
  };

  const renderNovidadeCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.novidadeText}>{item.novidade}</Text>
      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNovidade(item.$id)}
        >
          <Icon name="trash" size={20} color="#FF6347" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novidades</Text>
      <Text style={styles.subtitle}>Confira as últimas novidades e informações importantes!</Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={novidades}
          keyExtractor={(item) => item.$id}
          renderItem={renderNovidadeCard}
          contentContainerStyle={styles.list}
        />
      )}
      {isAdmin && (
        <View style={styles.adminContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar nova novidade..."
            value={novaNovidade}
            onChangeText={setNovaNovidade}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNovidade}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
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
    </View>
  );
};

export default Novidades;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  novidadeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
  },
  adminContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#126046',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
