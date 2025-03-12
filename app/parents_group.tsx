import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

const ParentsGroup = () => {
  const [gruposWhatsApp, setGruposWhatsApp] = useState([]);

  useEffect(() => {
    // Definindo os dois grupos fixos
    setGruposWhatsApp([
      { id: 'cidade', nome: 'Escola São Paulo RS - Cidade', whatsapp: 'https://chat.whatsapp.com/JSQtqBgAUon5J56iBavzhf' },
      { id: 'cassino', nome: 'Escola São Paulo RS - Cassino', whatsapp: 'https://chat.whatsapp.com/E8umgDKs6YY4zuJZPEmpge' },
    ]);
  }, []);

  const handleWhatsAppRedirect = (whatsappLink) => {
    Linking.openURL(whatsappLink).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.')
    );
  };

  const renderGroupCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.groupName}>{item.nome}</Text>
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
      <Text style={styles.title}>Grupos de Pais</Text>
      <Text style={styles.instruction}>
        Clique no ícone do WhatsApp para acessar o grupo.
      </Text>
      <FlatList
        data={gruposWhatsApp}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupCard}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default ParentsGroup;

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
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
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
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  whatsappIcon: {
    marginLeft: 16,
  },
});
