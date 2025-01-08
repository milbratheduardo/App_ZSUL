import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign, Feather } from '@expo/vector-icons';
import { getMetodologias, salvarMetodologia, excluirMetodologia } from '@/lib/appwrite';

const Metodologia = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];
  const [metodologias, setMetodologias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [newMetodologia, setNewMetodologia] = useState('');
  const [selectedMetodologia, setSelectedMetodologia] = useState(null);

  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';

  useEffect(() => {
    const fetchMetodologias = async () => {
      const response = await getMetodologias(user.userId);
      setMetodologias(response?.metodologias || []);
    };
    fetchMetodologias();
  }, [user]);

  const handleSaveMetodologia = async () => {
 
    if (newMetodologia.trim()) {
      await salvarMetodologia(user.userId, newMetodologia);
      setMetodologias([...metodologias, newMetodologia]);
      setNewMetodologia('');
      setModalVisible(false);
    }
  };

  const handleDeleteMetodologia = async () => {
    if (selectedMetodologia !== null) {
      await excluirMetodologia(user.userId, selectedMetodologia);
      setMetodologias(metodologias.filter((metodologia) => metodologia !== selectedMetodologia));
      setSelectedMetodologia(null);
      setConfirmModalVisible(false);
    }
  };

  const confirmDeleteMetodologia = (metodologia) => {
    setSelectedMetodologia(metodologia);
    setConfirmModalVisible(true);
  };

  const renderMetodologiaCard = (metodologia, index) => (
    <View key={index} style={styles.card}>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>Metodologia {index + 1}</Text>
        <Text style={styles.cardDescription}>{metodologia}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDeleteMetodologia(metodologia)} style={styles.deleteIcon}>
        <Icon name="trash" size={20} color="#FF6347" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
              <Text style={styles.userInfo}>{user?.nome} - E.F. SC São Paulo RS</Text>
            </View>
          </View>
          <Icon name="shield" size={50} color="#126046" style={styles.teamLogo} />
        </View>
      </View>

      {/* Lista de Metodologias */}
      <ScrollView contentContainerStyle={styles.metodologiasContainer}>
        {metodologias.map((metodologia, index) => renderMetodologiaCard(metodologia, index))}
      </ScrollView>

      {/* Botão de adicionar nova metodologia centralizado na parte inferior */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal para adicionar nova metodologia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar nova Metodologia</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da metodologia"
                value={newMetodologia}
                onChangeText={setNewMetodologia}
                placeholderTextColor="#666"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveMetodologia}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmação</Text>
            <Text style={styles.modalMessage}>
              Você realmente deseja excluir a metodologia "{selectedMetodologia}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.saveButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleDeleteMetodologia}>
                <Text style={styles.saveButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Metodologia;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  teamLogo: {
    marginLeft: 16,
  },
  metodologiasContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#126046',
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  deleteIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#126046',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#126046',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
