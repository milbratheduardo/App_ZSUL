import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getNotifica } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MensagensPais = () => {
  const { turmaId } = useLocalSearchParams();
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const fetchNotificacoes = async () => {
    setIsLoading(true);
    try {
      const response = await getNotifica();
      const filteredData = response.filter(
        (notifica) => notifica.turmaId === turmaId && notifica.publico === 'Responsáveis'
      );
      setNotificacoes(filteredData.reverse());

    } catch (error) {
      setErrorMessage(`Não foi possível carregar as notificações.`);
      setShowErrorModal(true);
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
        <Text style={styles.headerText}>Mensagens para Responsáveis</Text>
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

export default MensagensPais;

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
