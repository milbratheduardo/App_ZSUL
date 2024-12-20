import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAlunos } from '../lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SelecionarAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const { selectedAlunos: selectedAlunosFromParams, Title, Date_event, Description, Hora_event, Local } = useLocalSearchParams();

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
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
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

  const handleSelectAluno = (userId) => {
    setSelectedAlunos((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((selectedId) => selectedId !== userId)
        : [...prevSelected, userId]
    );
  };

  console.log(Date_event)
  const handleSave = () => {
    router.replace({
      pathname: '/cadastro_eventos',
      params: {
        selectedAlunos: selectedAlunos.join(','), // Lista dos userId dos alunos selecionados
        type: 'partida',
        Title,
        Date_event,
        Description,
        Hora_event,
        Local
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
    const isSelected = selectedAlunos.includes(item.userId);
    const position = positionDetails[item.posicao.toLowerCase()] || {};
    const alunoInfo = `${item.nome}`;

    return (
      <TouchableOpacity
        style={[styles.alunoContainer, isSelected && styles.alunoSelecionado]}
        onPress={() => handleSelectAluno(item.userId)}
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
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderAluno}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.iconButtonContainer}>
        <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
          <FontAwesome name="check" size={30} color="white" />
        </TouchableOpacity>
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
    backgroundColor: 'lightgreen',
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
