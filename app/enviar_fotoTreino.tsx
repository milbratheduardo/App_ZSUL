import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Feather } from '@expo/vector-icons';

const EnviarFotoTreino = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const { user, setSelectedImages } = useGlobalContext();

  const pickImages = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets;
        setSelectedFiles([...selectedFiles, ...files]);
        console.log('Arquivos selecionados:', files);
      } else {
        console.log('Seleção cancelada pelo usuário');
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivos:', error);
    }
  };

  const handleSetImagesForReport = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos uma imagem.');
      return;
    }

    const imagesToAdd = selectedFiles.map((file) => ({ ...file, title }));
    setSelectedImages((prevImages) => [...prevImages, ...imagesToAdd]); // Adiciona as imagens ao estado global
    Alert.alert('Sucesso', 'Imagens adicionadas ao relatório.');
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
});

export default EnviarFotoTreino;
