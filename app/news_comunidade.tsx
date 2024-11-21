import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getNovidades, saveNovidade, deleteNovidade } from '@/lib/appwrite'; // Substitua pelas funções do Appwrite
import { useGlobalContext } from '@/context/GlobalProvider';

const Novidades = () => {
  const { user } = useGlobalContext(); // user contém informações como `role`
  const [novidades, setNovidades] = useState([]);
  const [novaNovidade, setNovaNovidade] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'admin'; // Verifica se o usuário é administrador

  useEffect(() => {
    const fetchNovidades = async () => {
      try {
        const data = await getNovidades();
        setNovidades(data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as novidades.');
      } finally {
        setLoading(false);
      }
    };

    fetchNovidades();
  }, []);

  const handleAddNovidade = async () => {
    if (!novaNovidade.trim()) {
      Alert.alert('Atenção', 'O campo de novidade não pode estar vazio.');
      return;
    }

    try {
      const newNovidade = await saveNovidade(novaNovidade);
      setNovidades([...novidades, newNovidade]);
      setNovaNovidade('');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar a novidade.');
    }
  };

  const handleDeleteNovidade = async (id) => {
    try {
      await deleteNovidade(id);
      setNovidades(novidades.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir a novidade.');
    }
  };

  const renderNovidadeCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.novidadeText}>{item.text}</Text>
      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNovidade(item.id)}
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
          keyExtractor={(item) => item.id.toString()}
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
