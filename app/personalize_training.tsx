import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput, Image, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, sendPersonalizedTraining } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const TreinoPersonalizado = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTreino, setNewTreino] = useState({ nome: '', descricao: '', video: '' });
  const [treinos, setTreinos] = useState([
    {
      id: '1',
      nome: 'Treino de Resistência',
      descricao: 'Foco em aumentar a capacidade cardiovascular e a resistência muscular.',
      video: 'https://example.com/treino-resistencia-video',
      imagem: 'https://example.com/imagem-treino-resistencia.jpg',
    },
    {
      id: '2',
      nome: 'Treino de Velocidade',
      descricao: 'Treino específico para melhorar a velocidade de reação e deslocamento.',
      video: 'https://example.com/treino-velocidade-video',
      imagem: 'https://example.com/imagem-treino-velocidade.jpg',
    },
  ]);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      setAlunos(alunosData);
      setFilteredAlunos(alunosData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
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

  const handleSendTreino = async () => {
    if (!selectedAluno || !selectedTreino) {
      Alert.alert('Erro', 'Selecione um atleta e um treino.');
      return;
    }
    try {
      await sendPersonalizedTraining(selectedAluno, selectedTreino);
      Alert.alert('Sucesso', 'Treino enviado com sucesso');
      router.replace('/home');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar o treino');
    }
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  const openEditModal = (treino) => {
    setNewTreino(treino);
    setEditModalVisible(true);
  };

  const saveNewTreino = () => {
    const id = (treinos.length + 1).toString();
    setTreinos([...treinos, { id, ...newTreino, imagem: 'https://example.com/imagem-default.jpg' }]);
    setNewTreino({ nome: '', descricao: '', video: '' });
    setCreateModalVisible(false);
    Alert.alert('Sucesso', 'Novo treino adicionado!');
  };

  const saveEditedTreino = () => {
    setTreinos(treinos.map((t) => (t.id === newTreino.id ? newTreino : t)));
    setEditModalVisible(false);
    setNewTreino({ nome: '', descricao: '', video: '' });
    Alert.alert('Sucesso', 'Treino editado com sucesso!');
  };

  const deleteTreino = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => setTreinos(treinos.filter((t) => t.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Selecionar Atleta</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar atleta pelo nome"
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

      <View style={styles.sectionSpacer} />

      <Text style={styles.title}>Escolha o Treino</Text>
      <FlatList
        data={treinos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.treinoContainer,
              selectedTreino?.id === item.id && styles.treinoSelecionado,
            ]}
            onPress={() => setSelectedTreino(item)}
          >
            <Text style={styles.treinoText}>{item.nome}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
            <Image source={{ uri: item.imagem }} style={styles.treinoImagem} />
            {item.video ? (
              <Text
                style={styles.videoLink}
                onPress={() => Linking.openURL(item.video)}
              >
                Assistir Vídeo
              </Text>
            ) : null}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Feather name="edit" size={20} color="#126046" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTreino(item.id)}>
                <Feather name="trash" size={20} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
            {selectedTreino?.id === item.id && (
              <Text style={styles.checkmarkTreino}>✓</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <View style={styles.actionContainer}>
        <TouchableOpacity onPress={handleSendTreino} style={styles.iconButton}>
          <MaterialIcons name="send" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modais de criação e edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible || editModalVisible}
        onRequestClose={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {createModalVisible ? 'Criar Novo Treino' : 'Editar Treino'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Título do Treino"
              value={newTreino.nome}
              onChangeText={(text) => setNewTreino({ ...newTreino, nome: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Descrição"
              value={newTreino.descricao}
              onChangeText={(text) => setNewTreino({ ...newTreino, descricao: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Link do Vídeo ou Imagem"
              value={newTreino.video}
              onChangeText={(text) => setNewTreino({ ...newTreino, video: text })}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={createModalVisible ? saveNewTreino : saveEditedTreino}
            >
              <Text style={styles.modalButtonText}>
                {createModalVisible ? 'Salvar' : 'Atualizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#126046', textAlign: 'center' },
  searchInput: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginVertical: 12, backgroundColor: 'white' },
  alunoContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', borderRadius: 8, marginBottom: 10 },
  alunoSelecionado: { backgroundColor: '#d0f0d0' },
  alunoText: { fontSize: 16, color: '#333' },
  checkmark: { fontSize: 18, color: '#126046' },
  sectionSpacer: { height: 10, backgroundColor: '#f8f8f8' },
  treinoContainer: { padding: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', borderRadius: 8, marginBottom: 8, position: 'relative' },
  treinoSelecionado: { backgroundColor: '#d0f0d0' },
  treinoText: { fontSize: 16, color: '#333', textAlign: 'center', fontWeight: 'bold' },
  descricao: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 },
  treinoImagem: { width: '100%', height: 75, borderRadius: 8, marginTop: 10 },
  videoLink: { color: '#126046', textAlign: 'center', marginTop: 5, textDecorationLine: 'underline' },
  checkmarkTreino: { fontSize: 24, color: '#126046', position: 'absolute', top: 10, right: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  icon: { padding: 5 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  iconButton: { backgroundColor: '#126046', padding: 10, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  addButton: { backgroundColor: '#126046', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: 'white', fontSize: 36, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 8, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { width: '100%', height: 40, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 20 },
  modalButton: { backgroundColor: '#126046', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
});

export default TreinoPersonalizado;
