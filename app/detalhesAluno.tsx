import { View, Text, StyleSheet, Image, ImageBackground, Modal, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getAlunosById, getAllTurmas, updateAlunoTurma } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const detalhesAluno = () => {
  const [aluno, setAluno] = useState(null);
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAluno();
  }, [alunoId]);

  const fetchAluno = async () => {
    try {
      const alunoData = await getAlunosById(alunoId);

      // Verifica se o aluno tem uma turma associada
      if (alunoData.turmaId) {
        try {
          const turmas = await getAllTurmas();
          const turma = turmas.find((t) => t.$id === alunoData.turmaId);
          alunoData.turmaTitle = turma ? turma.title : 'Nenhuma Turma';
        } catch (error) {
          setErrorMessage(`Erro ao buscar título da turma.`);
          setShowErrorModal(true);
          alunoData.turmaTitle = 'Nenhuma Turma';
        }
      } else {
        alunoData.turmaTitle = 'Nenhuma Turma';
      }

      setAluno(alunoData);
    } catch (error) {
      setErrorMessage(`Erro ao buscar aluno.`);
      setShowErrorModal(true);
    }
  };

  const handleEdit = () => {
    router.push(`/edit_card_aluno?alunoId=${alunoId}`);
  };

  const handleInfo = () => {
    router.push(`/info_geral_aluno?alunoId=${alunoId}`);
  };
  const handleDesvincular = async () => {
    if (!aluno?.turmaId) {
      setErrorMessage("Este atleta não pertence a nenhuma turma.");
      setShowErrorModal(true);
      return;
    }
  
    try {
      // Função para fazer o update da turmaId para null
      await updateAlunoTurma(alunoId); 
      setAluno({ ...aluno, turmaId: null, turmaTitle: "Nenhuma Turma" });
  
      setSuccessMessage("Aluno desvinculado da turma com sucesso.");
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("Erro ao desvincular o aluno da turma.");
      setShowErrorModal(true);
    }
  };
  

  const calculateAge = (birthDate) => {
    const [day, month, year] = birthDate.split('/').map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!aluno) return null;

  return (
    <View style={styles.screenContainer}>
      {user.role == 'profissional' && (
        <>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Icon name="edit" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Editar Card</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton1} onPress={handleDesvincular}>
          <Icon name="remove" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Desvincular Aluno</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
      <View style={styles.cardContainer}>
        <ImageBackground 
          source={{ uri: 'https://path-to-your-card-background-image.png' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <Text style={styles.rating}>{aluno.geral || '80'}</Text>
          <Text style={styles.position}>{aluno.posicao}</Text>

          <Text style={styles.turmaText}>Turma: {aluno.turmaTitle || 'Nenhuma Turma'}</Text>
          

          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: aluno.imageUrl || aluno.avatar }} 
              style={styles.playerImage} 
            />
          </View>

          {/* Informações do atleta com layout em duas colunas */}
          <View style={styles.infoContainer}>
            <View style={styles.column}>
              <View style={styles.infoItem}>
                <Icon name="balance-scale" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Peso: {aluno.peso} kg</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="arrows-v" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Altura: {aluno.altura} cm</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="bolt" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Pique: {aluno.pique}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="soccer-ball-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Força: {aluno.forca}</Text>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.infoItem}>
                <Icon name="birthday-cake" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Idade: {aluno.birthDate}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="soccer-ball-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Pé: {aluno.peDominante}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="handshake-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Passe: {aluno.passe}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="crosshairs" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Finalização: {aluno.finalizacao}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
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
              <TouchableOpacity style={styles.editButton2} onPress={handleInfo}>
              <Icon name="info" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Info Geral</Text>
            </TouchableOpacity>
    </View>


);
};

export default detalhesAluno;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#004225', // Verde escuro
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginRight: 10
  },
  editButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'red', // Verde escuro
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  editButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'blue', // Verde escuro
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: 300
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },  
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fundo branco
  },
  cardContainer: {
    width: width * 0.85,
    aspectRatio: 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: '#004225', // Verde escuro do time
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    borderRadius: 20,
  },
  imageContainer: {
    position: 'absolute',
    top: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderColor: '#D32F2F', // Vermelho do time
    borderWidth: 2,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  rating: {
    position: 'absolute',
    top: '8%',
    left: '10%',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F', // Vermelho para destaque
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  turmaText: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: 'light',
  },
  anotext: {
    position: 'absolute',
    top: '62%',
    left: '10%',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: 'light',
  },
  position: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texto branco para contraste
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    textTransform: 'uppercase',
  },
  infoContainer: {
    position: 'absolute',
    bottom: '8%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  attributeText: {
    fontSize: 14,
    color: '#FFFFFF', // Texto branco para contraste
    marginLeft: 8,
    fontWeight: '600',
  },
});


export default detalhesAluno