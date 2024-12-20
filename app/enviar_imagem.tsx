import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Modal, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomButton from '@/components/CustomButton';
import { salvarImagem } from '@/lib/appwrite'; // Importar a função salvarImagem
import { useGlobalContext } from '@/context/GlobalProvider';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EnviarImagem = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const { user } = useGlobalContext(); // Obtém o usuário do contexto global
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');


  const pickImage = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Permite selecionar qualquer tipo de arquivo
      });
  
      console.log('Resultado da seleção:', result);
      setSelectedFile(result.assets[0]);
  
      if (!result.canceled) {
        const file = result.assets[0];
        console.log('Informações do arquivo selecionado:', file);
      } else {
        console.log('Seleção cancelada pelo usuário');
      }
    } catch (error) {
      setErrorMessage(`Erro ao selecionar os arquivos.`);
      setShowErrorModal(true);
    }
  };
  

  const saveImageToGallery = async () => {
    if (!selectedFile || !title) {
      setErrorMessage(`Por favor selecione uma imagem e insere um título.`);
      setShowErrorModal(true);
      return;
    }

    try {
      // Chama a função para salvar a imagem no banco de dados
      const response = await salvarImagem(selectedFile, title, user.userId);
      console.log('Imagem salva na galeria:', response);
      setSuccessMessage('Imagem salva com sucesso!');
      setShowSuccessModal(true);

      // Limpar estado
      setSelectedFile(null);
      setTitle('');
    } catch (error) {
      setErrorMessage(`Erro ao salvar imagem.`);
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text className="text-xl font-semibold mb-4 text-center">Galeria de Alunos</Text>

      <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20 }}>
        <View style={{ padding: 20, backgroundColor: 'lightgray', borderRadius: 8, alignItems: 'center' }}>
          {/* Substitui o texto pelo ícone de pasta */}
          <Feather name="folder" size={24} color="black" />
        </View>
      </TouchableOpacity>

      {selectedFile && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text>{selectedFile.name}</Text>
        </View>
      )}

      <TextInput
        placeholder="Digite um título para a imagem"
        value={title}
        onChangeText={setTitle}
        style={{ padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 20 }}
      />

      <CustomButton title="Salvar" handlePress={saveImageToGallery} />
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
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  campo: {
    marginVertical: 5,
    borderRadius: 100,
    borderWidth: 50,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  alunoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  selectedAlunoItem: {
    backgroundColor: '#e0ffe0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  alunoCheck: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
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

export default EnviarImagem;
