import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EnviarFotoTreino = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const { user, setSelectedImages } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const pickImages = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets;
        setSelectedFiles([...selectedFiles, ...files]);
      
      } else {
       
      }
    } catch (error) {
      setErrorMessage(`Erro ao selecionar arquivos.`);
      setShowErrorModal(true);
    }
  };

  const handleSetImagesForReport = () => {
    if (selectedFiles.length === 0) {
      setErrorMessage(`Por favor selecione uma imagem.`);
      setShowErrorModal(true);
      return;
    }

    const imagesToAdd = selectedFiles.map((file) => ({ ...file, title }));
    setSelectedImages((prevImages) => [...prevImages, ...imagesToAdd]); // Adiciona as imagens ao estado global
    setSuccessMessage('Imagens adicionadas com sucesso!');
    setShowSuccessModal(true);
    setSelectedFiles([]);
    setTitle('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Imagem do Treino</Text>

      <TouchableOpacity onPress={pickImages} style={styles.uploadButton}>
        <View style={styles.iconContainer}>
          <Feather name="folder" size={28} color="#006400" />
          <Text style={styles.iconText}>Escolher Imagens</Text>
        </View>
      </TouchableOpacity>

      {selectedFiles.length > 0 && (
        <FlatList
          data={selectedFiles}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{item.name}</Text>
            </View>
          )}
          style={{ marginBottom: 20 }}
        />
      )}

      <TextInput
        placeholder="Digite um título para as imagens"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <CustomButton title="Enviar" handlePress={handleSetImagesForReport} containerStyles={styles.addButton} />
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
            <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSuccessModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.successModal}>
                <MaterialCommunityIcons name="check-circle" size={48} color="white" />
                <Text style={styles.modalTitle}>Sucesso</Text>
                <Text style={styles.modalMessage}>{successMessage}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    
                  }}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  uploadButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '80%',
  },
  iconText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  fileInfo: {
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    width: '100%',
    backgroundColor: '#fff',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#006400',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
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
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default EnviarFotoTreino;
