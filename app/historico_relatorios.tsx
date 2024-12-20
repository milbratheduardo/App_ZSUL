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
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HistoricoRelatorios = () => {
  const { user } = useGlobalContext();
  const [relatorios, setRelatorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorMessage(`Não foi possível carregar os relatórios.`);
      setShowErrorModal(true);
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
                setSuccessMessage('Relatório excluído com sucesso!');
                setShowSuccessModal(true);
              }
            } catch (error) {
              setErrorMessage(`Não foi possível excluir o relatório.`);
              setShowErrorModal(true);
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
                    style={styles.closeButton2}
                    onPress={() => {
                      setShowSuccessModal(false);
                      
                    }}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
  closeButton2: {
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
