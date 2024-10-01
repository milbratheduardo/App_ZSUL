import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllImages, getImageUrl, getUsersById } from '@/lib/appwrite';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import EmptyState from '@/components/EmptyState';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Galeria = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useGlobalContext();
  const navigation = useNavigation();

  // Referência à notificação recebida para tratar a ação de abertura
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    fetchData();

    // Listener para quando uma notificação for recebida enquanto o app está em foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida!', notification);
    });

    // Listener para quando a notificação for clicada
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { uri } = response.notification.request.content.data;
      if (uri) {
        openImage(uri);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const images = await getAllImages();

      // Para cada imagem, buscar a URL e o username usando o `getImageUrl` e `getUsersById`
      const imagesWithDetails = await Promise.all(
        images.map(async (image) => {
          const imageUrl = await getImageUrl(image.imageId);
          const userDetail = await getUsersById(image.userId);
          return {
            ...image,
            uri: imageUrl,
            username: userDetail?.username || 'Usuário Desconhecido',
          };
        })
      );

      setData(imagesWithDetails);
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

      // Baixar a imagem
      const { uri } = await FileSystem.downloadAsync(fileUrl, downloadPath);

      // Compartilhar a imagem usando expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível no dispositivo.');
      }

      // Notificação de download concluído (opcional)
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

  // Função para abrir a imagem (navegar para uma tela apropriada ou exibir)
  const openImage = (uri) => {
    Alert.alert('Abrindo imagem', `Imagem localizada em: ${uri}`);
    // Alternativamente, redirecionar para uma tela específica do seu app
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
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 14, color: 'gray' }}>Imagem não disponível</Text>
              )}
              <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{item.title}</Text>
              <Text style={{ color: 'gray' }}>Enviado por: {item.username}</Text>
              <CustomButton
                title="Compartilhar"
                handlePress={() => handleDownloadAndShareImage(item.imageId)}
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
                handlePress={() => router.push('/enviar_imagem')}
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
                  resizeMode="contain"
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
