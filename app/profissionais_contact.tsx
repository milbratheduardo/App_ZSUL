import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getAllUsers, getAllProfissionais } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';

const ResponsaveisContact = () => {
  const { turmaId } = useLocalSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllUsers();
        const profissionais = users.filter((user) => user.role === 'profissional');
        const profissionaisData = await getAllProfissionais();

        const alunosComWhatsApp = profissionais.map((profissional) => {
          const profissionalData = profissionaisData.find(
            (prof) => prof.userId === profissional.userId
          );

          return {
            ...profissional,
            whatsapp: profissionalData?.whatsapp || '',
          };
        });

        setAlunos(alunosComWhatsApp);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar os dados dos responsáveis.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [turmaId]);

  const handleWhatsAppRedirect = (whatsapp) => {
    if (whatsapp) {
      const url = `https://wa.me/${whatsapp}`;
      Linking.openURL(url).catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.')
      );
    } else {
      Alert.alert('Atenção', 'WhatsApp não disponível para este responsável.');
    }
  };

  const renderAlunoCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.alunoNome}>{item.nome}</Text>
        <Text style={styles.responsavelNome}>WhatsApp: {item.whatsapp}</Text>
      </View>
      <TouchableOpacity
        style={styles.whatsappIcon}
        onPress={() => handleWhatsAppRedirect(item.whatsapp)}
      >
        <Icon name="whatsapp" size={24} color="#25D366" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contatos dos Responsáveis</Text>
      <Text style={styles.instruction}>
        Clique no ícone do WhatsApp para enviar uma mensagem diretamente ao responsável.
      </Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.userId} // Use o campo correto para ID único
          renderItem={renderAlunoCard}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default ResponsaveisContact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  responsavelNome: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  whatsappIcon: {
    marginLeft: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
});
