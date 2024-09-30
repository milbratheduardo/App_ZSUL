import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllImages, getImageUrl } from '@/lib/appwrite';
import * as FileSystem from 'expo-file-system';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

const Galeria = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Estado para a imagem selecionada
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para exibir o modal
  const { user } = useGlobalContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const images = await getAllImages(); // Buscar todas as imagens da galeria

      // Para cada imagem, buscar a URL usando o `getImageUrl`
      const imagesWithUrls = await Promise.all(
        images.map(async (image) => {
          const imageUrl = await getImageUrl(image.imageId); // Obtém a URL usando o ID da imagem
          return {
            ...image,
            uri: imageUrl,
          };
        })
      );

      setData(imagesWithUrls);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleImagePress = (image) => {
    setSelectedImage(image); // Define a imagem selecionada
    setIsModalVisible(true); // Abre o modal
  };

  const closeModal = () => {
    setIsModalVisible(false); // Fecha o modal
    setSelectedImage(null); // Limpa a imagem selecionada
  };

  const handleDownloadImage = async (imageId) => {
    try {
      const fileUrl = await getImageUrl(imageId); // Obter a URL da imagem usando o ID
      const downloadPath = `${FileSystem.documentDirectory}${imageId}.jpg`; // Caminho onde a imagem será salva localmente

      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        downloadPath
      );

      const { uri } = await downloadResumable.downloadAsync();
      Alert.alert('Sucesso', `Imagem baixada com sucesso para: ${uri}`);
    } catch (error) {
      console.error("Erro ao baixar a imagem:", error);
      Alert.alert('Erro', 'Não foi possível baixar a imagem.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 16 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.imageId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImagePress(item)}>
            <View style={{ padding: 10, backgroundColor: 'white', marginVertical: 5, borderRadius: 8 }}>
              {item.uri ? (
                <Image 
                  source={{ uri: item.uri }}
                  style={{ width: '100%', height: 150, borderRadius: 8 }}
                  resizeMode="contain" // Ajusta a imagem para caber dentro do contêiner mantendo a proporção
                />
              ) : (
                <Text style={{ fontSize: 14, color: 'gray' }}>Imagem não disponível</Text>
              )}
              <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{item.title}</Text>
              <Text style={{ color: 'gray' }}>Enviado por: {item.userId}</Text>
              <CustomButton 
                title="Download"
                handlePress={() => handleDownloadImage(item.imageId)}
                containerStyles="p-3 mt-2"
              />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
                <Text className="text-2xl font-psemibold text-golden">
                  {user?.username.split(' ')[0]}
                </Text>
              </View>
              <Image source={images.logo_zsul} style={{ width: 115, height: 35 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', color: '#333' }}>Galeria de Imagens</Text>
              <CustomButton 
                title="Enviar Imagem"
                handlePress={() => router.push('/enviar_imagem')} // Direciona para a tela de enviar imagem
                containerStyles="ml-1 p-2"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Imagem Encontrada"
            subtitle="Não há imagens na galeria"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal para visualizar a imagem selecionada */}
      {selectedImage && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
          animationType="slide"
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, width: '90%' }}>
              {selectedImage.uri ? (
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={{ width: '100%', height: 200, borderRadius: 8 }}
                  resizeMode="contain" // Ajusta a imagem para caber dentro do contêiner mantendo a proporção
                />
              ) : (
                <Text style={{ fontSize: 14, color: 'gray' }}>Imagem não disponível</Text>
              )}
              <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>
                {selectedImage.title}
              </Text>
              <CustomButton 
                title="Fechar" 
                containerStyles="p-4 mt-4"
                handlePress={closeModal} 
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Galeria;
