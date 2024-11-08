import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import CustomButton from '@/components/CustomButton';
import { salvarImagem } from '@/lib/appwrite'; // Importar a função salvarImagem
import { useGlobalContext } from '@/context/GlobalProvider';
import { Feather } from '@expo/vector-icons';

const EnviarImagem = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const { user } = useGlobalContext(); // Obtém o usuário do contexto global


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
      console.error('Erro ao selecionar arquivo:', error);
    }
  };
  

  const saveImageToGallery = async () => {
    if (!selectedFile || !title) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem e insira um título.');
      return;
    }

    try {
      // Chama a função para salvar a imagem no banco de dados
      const response = await salvarImagem(selectedFile, title, user.userId);
      console.log('Imagem salva na galeria:', response);
      Alert.alert('Sucesso', 'Imagem salva com sucesso na galeria.');

      // Limpar estado
      setSelectedFile(null);
      setTitle('');
    } catch (error) {
      console.error('Erro ao salvar imagem na galeria:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem na galeria.');
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
    </SafeAreaView>
  );
};

export default EnviarImagem;
