import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAlunos } from '../lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const SelecionarAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { selectedAlunos: selectedAlunosFromParams, Title, Date_event, Description, Hora_event } = useLocalSearchParams();

  useEffect(() => {
    if (selectedAlunosFromParams) {
      setSelectedAlunos(selectedAlunosFromParams.split(','));
    }
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos.slice(0, 10));
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
    }
  };

  const handleSelectAluno = (id) => {
    setSelectedAlunos((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSave = () => {
    router.replace({
      pathname: '/cadastro_eventos',
      params: {
        selectedAlunosIds: selectedAlunos.join(','),
        type: 'partida',
        Title,
        Date_event,
        Description,
        Hora_event,
      },
    });
  };

  const positionDetails = {
    goleiro: { abbreviation: 'GL', color: '#800080' },
    'zagueiro central': { abbreviation: 'ZC', color: '#1E90FF' },
    'lateral direito': { abbreviation: 'LD', color: '#1E90FF' },
    'lateral esquerdo': { abbreviation: 'LE', color: '#1E90FF' },
    volante: { abbreviation: 'VOL', color: '#32CD32' },
    'meia central': { abbreviation: 'MC', color: '#32CD32' },
    'meia ofensivo': { abbreviation: 'MO', color: '#32CD32' },
    'meia defensivo': { abbreviation: 'MD', color: '#32CD32' },
    'ponta direita': { abbreviation: 'PD', color: '#FF6347' },
    'ponta esquerda': { abbreviation: 'PE', color: '#FF6347' },
    centroavante: { abbreviation: 'CA', color: '#FF6347' },
  };

  const renderAluno = ({ item }) => {
    const isSelected = selectedAlunos.includes(item.$id);
    const position = positionDetails[item.posicao.toLowerCase()] || {};
    const alunoInfo = `${item.nome}`;

    return (
      <TouchableOpacity
        style={[styles.alunoContainer, isSelected && styles.alunoSelecionado]}
        onPress={() => handleSelectAluno(item.$id)}
      >
        <View style={styles.alunoInfo}>
          <Image source={{ uri: item.avatar }} style={styles.alunoAvatar} />
          <View>
            <Text style={styles.alunoNome}>{alunoInfo}</Text>
          </View>
        </View>
        <View style={[styles.posicaoContainer, { backgroundColor: position.color || '#808080' }]}>
          <Text style={styles.posicaoText}>{position.abbreviation || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecionar Alunos</Text>
      </View>
      <TextInput
        placeholder="Buscar aluno"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {filteredAlunos.length === 0 ? (
        <Text style={styles.noAlunosText}>Nenhum aluno encontrado</Text>
      ) : (
        <FlatList
          data={filteredAlunos}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={renderAluno}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.iconButtonContainer}>
        <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
          <FontAwesome name="check" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SelecionarAlunos;

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#126046',
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  alunoSelecionado: {
    backgroundColor: 'lightgray',
  },
  alunoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alunoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  posicaoContainer: {
    width: 40,
    borderRadius: 5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posicaoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  iconButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#126046',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  noAlunosText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});
