import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getNovidades, salvarNovidade, deleteNovidade, getAllProfissionais } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Novidades = () => {
  const { user } = useGlobalContext();
  const [novidades, setNovidades] = useState([]);
  const [novaNovidade, setNovaNovidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isAdmin = user.admin === 'admin';

  useEffect(() => {
    const fetchNovidades = async () => {
      try {
        const data = await getNovidades();

        // Adicionar o nome do autor para cada novidade
        const profissionais = await getAllProfissionais();
        const novidadesComAutor = data.map((novidade) => {
          const profissional = profissionais.find(
            (prof) => prof.userId === novidade.userId
          );
          return {
            ...novidade,
            authorName: profissional?.nome || 'Autor desconhecido',
          };
        });

        setNovidades(novidadesComAutor);
      } catch (error) {
        setErrorMessage('Não foi possível carregar as notícias.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNovidades();
  }, []);

  const handleAddNovidade = async () => {
    if (!novaNovidade.trim()) {
      setErrorMessage('O campo de novidade não pode estar vazio.');
      setShowErrorModal(true);
      return;
    }

    const novidadeData = {
      novidade: novaNovidade,
      userId: user?.userId || 'Desconhecido',
    };

    try {
      const newNovidade = await salvarNovidade(novidadeData);
      const profissionais = await getAllProfissionais();
      const profissional = profissionais.find(
        (prof) => prof.userId === newNovidade.userId
      );

      setNovidades((prev) => [
        ...prev,
        {
          ...newNovidade,
          authorName: profissional?.nome || 'Autor desconhecido',
        },
      ]);
      setNovaNovidade('');
    } catch (error) {
      setErrorMessage('Não foi possível salvar a notícia.');
      setShowErrorModal(true);
    }
  };

  const handleDeleteNovidade = async (id) => {
    try {
      await deleteNovidade(id);
      setNovidades(novidades.filter((item) => item.$id !== id));
    } catch (error) {
      setErrorMessage('Não foi possível deletar a notícia.');
      setShowErrorModal(true);
    }
  };

  const renderNovidadeCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.novidadeText}>{item.novidade}</Text>
      <Text style={styles.authorText}>Por: {item.authorName}</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  novidadeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  modalText: {
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
    color: 'red',
    fontWeight: 'bold',
  },
});
