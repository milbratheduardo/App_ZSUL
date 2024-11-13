import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getNotifica } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';

const MensagensAlunos = () => {
  const { turmaId } = useLocalSearchParams();
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotificacoes = async () => {
    setIsLoading(true);
    try {
      const response = await getNotifica();
      const filteredData = response.filter(
        (notifica) => notifica.turmaId === turmaId && notifica.publico === 'Atletas'
      );
      setNotificacoes(filteredData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as notificações.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const renderNotificacao = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Icon name="calendar" size={16} color="#126046" />
        <Text style={styles.messageDate}>{item.data}</Text>
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.messageTime}>{item.hora}</Text>
        <Text style={styles.messageText}>{item.observacoes}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mensagens para Atletas</Text>
        <Text style={styles.subHeaderText}>Veja as notificações e avisos</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#126046" style={{ marginTop: 20 }} />
      ) : notificacoes.length === 0 ? (
        <Text style={styles.noMessagesText}>Nenhuma notificação encontrada</Text>
      ) : (
        <FlatList
          data={notificacoes}
          renderItem={renderNotificacao}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default MensagensAlunos;

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
  messageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  messageContent: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#444',
  },
  noMessagesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
