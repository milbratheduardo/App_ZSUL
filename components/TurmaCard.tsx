import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAlunosByTurmaId } from '@/lib/appwrite';
import { router } from 'expo-router';

const TurmasCard = ({ turma: { turmaId, title, Horario_de_inicio, Local, Dia1, Dia2, Dia3, Sub, Horario_de_termino, MaxAlunos } }) => {
  const [vagasDisponiveis, setVagasDisponiveis] = useState();

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunos = await getAlunosByTurmaId(turmaId);
        setVagasDisponiveis(alunos.length);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    };

    fetchAlunos();
  }, [turmaId, MaxAlunos]);

  const handleEdit = () => {
    if (turmaId) {
      router.push({
        pathname: '/controle_turmas',
        params: { turmaId },
      });
    } else {
      console.error("turmaId está undefined");
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.cardContainer}
      onPress={handleEdit} // Torna o card clicável
    >
      <View style={styles.backgroundShape}></View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.info}>
            Horário: {Horario_de_inicio} - {Horario_de_termino}
          </Text>

          <View style={styles.iconsContainer}>
            <Icon name="futbol-o" size={22} color="#fff" style={styles.footballIcon} />
            <View style={styles.vagasContainer}>
              <Icon name="users" size={18} color="#fff" />
              <Text style={styles.vagasCount}>{vagasDisponiveis}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.additionalInfo}>Categoria: Sub - {Sub}</Text>
        <Text style={styles.additionalInfo}>Dias: {Dia1} | {Dia2} | {Dia3}</Text>
        <Text style={styles.additionalInfo}>Local: {Local}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#003300', // Fundo verde escuro
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundShape: {
    position: 'absolute',
    bottom: 0,
    right: 70,
    height: '90%',
    width: '100%',
    backgroundColor: '#005500', 
    borderTopRightRadius: 50,
    zIndex: -1,
  },
  contentContainer: {
    flexDirection: 'column',
    zIndex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    color: '#d3d3d3',
    fontSize: 14,
  },
  iconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  footballIcon: {
    marginBottom: 10,
    marginTop: -30,
  },
  vagasContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  vagasCount: {
    color: '#ffcc00',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  additionalInfo: {
    color: '#d3d3d3',
    fontSize: 12,
    marginTop: 5,
  },
});

export default TurmasCard;
