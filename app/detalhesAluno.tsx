import { View, Text, StyleSheet, Image, ImageBackground, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getAlunosById } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const detalhesAluno = () => {
  const [aluno, setAluno] = useState(null);
  const { alunoId } = useLocalSearchParams();

  useEffect(() => {
    fetchAluno();
  }, [alunoId]);

  const fetchAluno = async () => {
    try {
      const alunoData = await getAlunosById(alunoId);
      setAluno(alunoData);
    } catch (error) {
      console.error('Erro ao buscar aluno:', error.message);
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
      <View style={styles.cardContainer}>
        <ImageBackground 
          source={{ uri: 'https://path-to-your-card-background-image.png' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <Text style={styles.rating}>{aluno.rating || '80'}</Text>
          <Text style={styles.position}>{aluno.posicao}</Text>

          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: aluno.imageUrl || 'https://via.placeholder.com/150' }} 
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
                <Text style={styles.attributeText}>Pique: 85</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="soccer-ball-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Força: 100</Text>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.infoItem}>
                <Icon name="birthday-cake" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Idade: {calculateAge(aluno.birthDate)} anos</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="soccer-ball-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Pé: {aluno.peDominante}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="handshake-o" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Passe: 58</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="crosshairs" size={18} color="#FFFFFF" />
                <Text style={styles.attributeText}>Finalização: 98</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

export default detalhesAluno;

const styles = StyleSheet.create({
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