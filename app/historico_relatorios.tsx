import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  getAllRelatorios,
  getAllProfissionais,
  getTurmaById,
  getImageUrlTreinos,
  deleteRelatorio,
} from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const HistoricoRelatorios = () => {
  const { user } = useGlobalContext();
  const [relatorios, setRelatorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    setIsLoading(true);
    try {
      let response = await getAllRelatorios();

      if (user.admin !== 'admin') {
        response = response.filter((relatorio) => relatorio.userId === user.userId);
      }

      const profissionais = await getAllProfissionais();

      const relatoriosComDetalhes = await Promise.all(
        response.map(async (relatorio) => {
          try {
            const autor = profissionais.find(
              (profissional) => profissional.userId === relatorio.userId
            );

            const turma = await getTurmaById(relatorio.turmaId);

            const imagens = await Promise.all(
              relatorio.imagens.map(async (imageId) => {
                try {
                  const uri = await getImageUrlTreinos(imageId);
                  return { id: imageId, uri };
                } catch {
                  console.error(`Erro ao carregar imagem com ID ${imageId}`);
                  return null;
                }
              })
            ).then((imgList) => imgList.filter((img) => img !== null));

            return {
              ...relatorio,
              autor: autor ? autor.nome : 'Autor desconhecido',
              turmaTitle: turma.title || 'Turma desconhecida',
              imagens,
            };
          } catch (error) {
            console.error('Erro ao buscar detalhes do relatório:', error.message);
            return { ...relatorio, autor: 'Erro', turmaTitle: 'Erro', imagens: [] };
          }
        })
      );

      setRelatorios(relatoriosComDetalhes);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os relatórios.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewImages = (images) => {
    setSelectedImages(images);
    setIsModalVisible(true);
  };

  const handleDeleteRelatorio = (relatorioId) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir este relatório?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteRelatorio(relatorioId);
              if (success) {
                setRelatorios((prevRelatorios) =>
                  prevRelatorios.filter((relatorio) => relatorio.$id !== relatorioId)
                );
                Alert.alert('Sucesso', 'Relatório excluído com sucesso.');
              }
            } catch (error) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir o relatório.');
            }
          },
        },
      ]
    );
  };

  const renderRelatorioCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.imagens.length > 0 ? (
          <>
            <Image
              source={{ uri: item.imagens[0].uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.viewIcon}
              onPress={() => handleViewImages(item.imagens)}
            >
              <Feather name="eye" size={24} color="#126046" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.imagePlaceholder}>Imagem não disponível</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>
          {item.turmaTitle} - {item.data}
        </Text>
        <Text style={styles.subtitle}>Enviado por: {item.autor}</Text>
        <Text style={styles.metodologias}>
          Metodologias: {item.metodologias.join(', ')}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDeleteRelatorio(item.$id)}>
          <Feather name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Histórico de Relatórios</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={relatorios}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={renderRelatorioCard}
        />
      )}

      {selectedImages.length > 0 && (
        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.scrollView}
            >
              {selectedImages.map((image) => (
                <Image key={image.id} source={{ uri: image.uri }} style={styles.modalImage} />
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setSelectedImages([]);
              }}
            >
              <Feather name="x" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default HistoricoRelatorios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#126046',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  viewIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  infoContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  metodologias: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: 300,
    height: 400,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  scrollView: {
    flexGrow: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});
