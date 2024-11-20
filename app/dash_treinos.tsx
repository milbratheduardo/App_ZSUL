import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getTreinosPersonalizados, getAlunosById } from '@/lib/appwrite'; // Substitua pelo caminho real
import { useGlobalContext } from '@/context/GlobalProvider';

const DashTreinos = () => {
  const { user } = useGlobalContext();
  const [treinos, setTreinos] = useState([]);
  const [selectedTreino, setSelectedTreino] = useState(null);

  useEffect(() => {
    fetchTreinos();
  }, []);

  const fetchTreinos = async () => {
    try {
      const response = await getTreinosPersonalizados(user.userId);

      // Atualizar cada treino com o nome do aluno
      const treinosComNomes = await Promise.all(
        response.map(async (treino) => {
          try {
            const aluno = await getAlunosById(treino.aluno); // Buscar o aluno pelo ID
            return { ...treino, nomeAluno: aluno.nome }; // Adicionar o nome do aluno ao treino
          } catch (error) {
            console.error(`Erro ao buscar nome do aluno para treino ${treino.$id}:`, error.message);
            return { ...treino, nomeAluno: 'Aluno não encontrado' }; // Valor padrão se houver erro
          }
        })
      );

      setTreinos(treinosComNomes);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os treinos.');
      console.error(error);
    }
  };

  const openEditModal = (treino) => {
    Alert.alert('Editar', `Editar treino: ${treino.titulo}`);
    // Implemente a lógica de edição aqui
  };

  const deleteTreino = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          setTreinos(treinos.filter((t) => t.$id !== id));
          Alert.alert('Sucesso', 'Treino excluído com sucesso!');
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
          <TouchableOpacity
            style={[
              styles.treinoContainer,
              selectedTreino?.$id === item.$id && styles.treinoSelecionado,
            ]}
            onPress={() => setSelectedTreino(item)}
          >
            <Text style={styles.treinoText}>
              {item.titulo} - {item.nomeAluno}
            </Text>
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
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Feather name="edit" size={20} color="#126046" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTreino(item.$id)}>
                <Feather name="trash" size={20} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
            {selectedTreino?.$id === item.$id && (
              <Text style={styles.checkmarkTreino}>✓</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default DashTreinos;

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
  treinoSelecionado: { backgroundColor: '#d0f0d0' },
  treinoText: { fontSize: 16, color: '#333', textAlign: 'center', fontWeight: 'bold' },
  descricao: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 },
  videoLink: { color: '#126046', textAlign: 'center', marginTop: 5, textDecorationLine: 'underline' },
  checkmarkTreino: { fontSize: 24, color: '#126046', position: 'absolute', top: 10, right: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  icon: { padding: 5 },
});
