import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTurmas, getAlunosByTurmaId, savePersonalizedTraining } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const TreinoPersonalizado = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTreino, setNewTreino] = useState({ titulo: '', descricao: '', link: '' });

  useEffect(() => {
    fetchAlunosFromTurmas();
  }, []);

  const fetchAlunosFromTurmas = async () => {
    try {
      // Passo 1: Buscar todas as turmas
      const turmas = await getAllTurmas();
  
      // Passo 2: Verificar se o usuário é admin ou profissional
      const minhasTurmas = user.admin === 'admin'
        ? turmas // Admin: todas as turmas
        : turmas.filter((turma) => turma.profissionalId.includes(user.userId)); // Profissional: turmas do usuário
  
      // Passo 3: Buscar alunos para cada turma
      const alunosPromises = minhasTurmas.map((turma) =>
        getAlunosByTurmaId(turma.$id)
      );
  
      const alunosData = await Promise.all(alunosPromises);
  
      // Passo 4: Consolidar todos os alunos em uma lista única
      const todosAlunos = alunosData.flat();
  
      setAlunos(todosAlunos);
      setFilteredAlunos(todosAlunos);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos das suas turmas');
      console.error(error);
    }
  };
  

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAlunos(filtered);
    } else {
      setFilteredAlunos(alunos);
    }
  };

  const handleSaveTreino = async () => {
    if (!newTreino.titulo || !newTreino.descricao || !newTreino.link) {
      Alert.alert('Erro', 'Preencha todos os campos do treino.');
      return;
    }

    if (!selectedAluno) {
      Alert.alert('Erro', 'Selecione um aluno.');
      return;
    }

    try {
      await savePersonalizedTraining({
        titulo: newTreino.titulo,
        descricao: newTreino.descricao,
        link: newTreino.link,
        professor: user.userId,
        aluno: selectedAluno,
      });
      Alert.alert('Sucesso', 'Treino salvo com sucesso!');
      setModalVisible(false);
      setNewTreino({ titulo: '', descricao: '', link: '' });
      setSelectedAluno(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Selecionar Aluno</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar aluno pelo nome"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlatList
          data={filteredAlunos}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.alunoContainer,
                selectedAluno === item.userId && styles.alunoSelecionado,
              ]}
              onPress={() => setSelectedAluno(item.userId)}
            >
              <Text style={styles.alunoText}>{item.nome}</Text>
              <Text style={styles.checkmark}>
                {selectedAluno === item.userId ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Botão circular para abrir o modal */}
      <TouchableOpacity
        style={styles.circularButton}
        onPress={() => setModalVisible(true)}
        disabled={!selectedAluno} // Desabilita se nenhum aluno for selecionado
      >
        <Text style={styles.circularButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal para Descrever o Treino */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Descreva o Treino</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Título"
              value={newTreino.titulo}
              onChangeText={(text) => setNewTreino({ ...newTreino, titulo: text })}
            />
            <TextInput
              style={styles.modalInputDescription}
              placeholder="Descrição"
              value={newTreino.descricao}
              multiline={true} // Permite múltiplas linhas
              numberOfLines={4} // Inicializa com 4 linhas visíveis
              onChangeText={(text) => setNewTreino({ ...newTreino, descricao: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Link do Vídeo (Youtube)"
              value={newTreino.link}
              onChangeText={(text) => setNewTreino({ ...newTreino, link: text })}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSaveTreino}
            >
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TreinoPersonalizado;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  scrollView: { flexGrow: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#126046', textAlign: 'center' },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 12,
    backgroundColor: 'white',
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  alunoSelecionado: { backgroundColor: '#d0f0d0' },
  alunoText: { fontSize: 16, color: '#333' },
  checkmark: { fontSize: 18, color: '#126046' },
  circularButton: {
    backgroundColor: '#126046',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    elevation: 5,
  },
  circularButtonText: { color: 'white', fontSize: 24, lineHeight: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  modalInputDescription: {
    width: '100%',
    height: 120, // Maior altura para o campo de descrição
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlignVertical: 'top', // Alinha o texto no topo
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
