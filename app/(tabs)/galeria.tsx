import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllImages, getImageUrl, getAlunosByUserId, deleteImageByImageId } from '@/lib/appwrite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const Galeria = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
          let username = 'Professor';
  
          try {
            const alunos = await getAlunosByUserId(image.userId);
            if (alunos.length > 0) {
              username = alunos[0].nome || 'Professor'; // Pega o nome do primeiro aluno retornado
            }
          } catch (error) {
            setErrorMessage(error.message);
            setShowErrorModal(true);
          }
  
          return {
            ...image,
            uri: imageUrl,
            username,
          };
        })
      );
  
      setData(imagesWithDetails.reverse());
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
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

  const handleDeleteImage = async (imageId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta imagem?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await deleteImageByImageId(imageId);
              Alert.alert("Sucesso", "Imagem excluída com sucesso.");
              fetchData(); // Atualiza a lista após a exclusão
            } catch (error) {
              setErrorMessage(error.message);
              setShowErrorModal(true);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  

  const handleDownloadAndShareImage = async (imageId) => {
    try {
      const fileUrl = await getImageUrl(imageId);
      const downloadPath = `${FileSystem.documentDirectory}${imageId}.jpg`;

      const { uri } = await FileSystem.downloadAsync(fileUrl, downloadPath);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        setErrorMessage(`Erro: Compartilhamento não disponível no dispositivo.`);
        setShowErrorModal(true);
      }
      
    } catch (error) {
      setErrorMessage(`Não foi possível baixar a imagem.`);
      setShowErrorModal(true);
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
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => handleDownloadAndShareImage(item.imageId)}
          style={styles.shareButton}
        >
          <Feather name="send" size={20} color="white" />
        </TouchableOpacity>
        {user.admin === 'admin' && (
          <TouchableOpacity
            onPress={() => handleDeleteImage(item.imageId)}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
  

  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.imageId}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Imagem Encontrada"
            subtitle="Não há imagens na galeria"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        onPress={() => router.push('/enviar_imagem')}
        style={styles.addButton}
      >
        <Feather name="camera" size={24} color="white" />
      </TouchableOpacity>
      {selectedImage && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
          animationType="slide"
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {selectedImage.uri ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.imagePlaceholder}>Imagem não disponível</Text>
              )}
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              <CustomButton
                title="Fechar"
                containerStyles="p-4 mt-4"
                handlePress={closeModal}
              />
            </View>
          </View>
        </Modal>
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
    zIndex: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    marginBottom: 10, // Espaçamento entre os botões
  },
  deleteButton: {
    backgroundColor: '#D30A0C',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },  
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
