import { View, Text, StyleSheet, FlatList, Alert, Modal, TouchableOpacity, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getAllUsers, getAllProfissionais } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ResponsaveisContact = () => {
  const { turmaId } = useLocalSearchParams();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profissionaisData = await getAllProfissionais();
        const profissionaisComWhatsApp = profissionaisData.map((profissional) => ({
          ...profissional,
          whatsapp: profissional.whatsapp || '', // Garantir que whatsapp não seja undefined
        }));

        setProfissionais(profissionaisComWhatsApp);
      } catch (error) {
        setErrorMessage(`Não foi possível carregar os profissionais.`);
        setShowErrorModal(true);
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
      setErrorMessage(`Whatsapp não disponível para este usuário.`);
      setShowErrorModal(true);
    }
  };

  const renderProfissionalCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.profissionalNome}>{item.nome}</Text>
        <Text style={styles.whatsappText}>Profissão: {item.profissao || 'Não disponível'}</Text>
      </View>
      {item.whats ? (
        <TouchableOpacity
          style={styles.whatsappIcon}
          onPress={() => handleWhatsAppRedirect(item.whats)}
        >
          <Icon name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contatos dos Profissionais</Text>
      <Text style={styles.instruction}>
        Clique no ícone do WhatsApp para enviar uma mensagem diretamente ao profissional.
      </Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.userId} // Use o campo correto para ID único
          renderItem={renderProfissionalCard}
          contentContainerStyle={styles.list}
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
  profissionalNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  whatsappText: {
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
