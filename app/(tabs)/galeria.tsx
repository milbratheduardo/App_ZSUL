import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllImages, getImageUrl, getUsersById, deleteImageByImageId } from '@/lib/appwrite';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';

const Galeria = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useGlobalContext();
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const images = await getAllImages();

      const imagesWithDetails = await Promise.all(
        images.map(async (image) => {
          const imageUrl = await getImageUrl(image.imageId);
          const userDetail = await getUsersById(image.userId);

          return {
            ...image,
            uri: imageUrl,
            username: userDetail?.nome || 'Usuário Desconhecido',
          };
        })
      );

      setData(imagesWithDetails.reverse());
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const handleDownloadAndShareImage = async (imageId) => {
    try {
      const fileUrl = await getImageUrl(imageId);
      const downloadPath = `${FileSystem.documentDirectory}${imageId}.jpg`;

      const { uri } = await FileSystem.downloadAsync(fileUrl, downloadPath);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível no dispositivo.');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Download Completo',
          body: 'Imagem baixada e pronta para compartilhamento.',
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Erro ao baixar a imagem:", error);
      Alert.alert('Erro', 'Não foi possível baixar a imagem.');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerWelcome}>
        <Text style={styles.headerTitle}>Bem Vindo</Text>
        <Text style={styles.headerUserName}>{user?.nome.split(' ')[0]}</Text>
      </View>
      <Image source={images.escola_sp_transparente} style={styles.headerImage} />
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)} style={styles.imageCard}>
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={styles.imagePlaceholder}>Imagem não disponível</Text>
      )}
      <Text style={styles.imageTitle}>{item.title}</Text>
      <Text style={styles.imageAuthor}>Enviado por: {item.username}</Text>

      <TouchableOpacity
        onPress={() => handleDownloadAndShareImage(item.imageId)}
        style={styles.shareButton}
      >
        <Feather name="send" size={20} color="white" />
      </TouchableOpacity>

      {(user.role === 'admin' || user.role === 'professor') && (
        <TouchableOpacity
          onPress={() => handleDeleteImage(item.imageId)}
          style={styles.deleteButton}
        >
          <AntDesign name="delete" size={20} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.imageId}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => <EmptyState title="Nenhuma Imagem Encontrada" subtitle="Não há imagens na galeria" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        contentContainerStyle={styles.listContent}
      />

      {/* Botão para Adicionar Fotos na parte inferior central */}
      <TouchableOpacity
        onPress={() => router.push('/enviar_imagem')}
        style={styles.addButton}
      >
        <Feather name="camera" size={24} color="white" />
      </TouchableOpacity>

      {selectedImage && (
        <Modal transparent={true} visible={isModalVisible} onRequestClose={closeModal} animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {selectedImage.uri ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.modalImage} resizeMode="contain" />
              ) : (
                <Text style={styles.imagePlaceholder}>Imagem não disponível</Text>
              )}
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              <CustomButton title="Fechar" containerStyles="p-4 mt-4" handlePress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Galeria;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerWelcome: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 16,
    color: '#126046',
  },
  headerUserName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
  },
  headerImage: {
    width: 80,
    height: 80,
  },
  addButton: {
    
    bottom: 75,
    alignSelf: 'center',
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 20,  
    elevation: 5,
    zIndex: 10, // Garante que o botão fique acima de outros elementos
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Espaço para o botão na parte inferior
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  imageTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  imageAuthor: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 5,
  },
  shareButton: {
    backgroundColor: '#126046',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: 80,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#D30A0C',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: 80,
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});
