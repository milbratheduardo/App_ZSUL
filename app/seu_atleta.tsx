import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllTurmas, getAlunosByTurmaId, getChamadasByTurmaId, getTreinosPersonalizadosByAlunoId } from '@/lib/appwrite';

const AlunoProfile = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const allTurmas = await getAllTurmas(); // Obtenha todas as turmas
        const turmasData = await Promise.all(
          allTurmas.map(async (turma) => {
            const [turmaAlunos, chamadas] = await Promise.all([
              getAlunosByTurmaId(turma.$id), // Obtenha os alunos da turma
              getChamadasByTurmaId(turma.$id), // Obtenha as chamadas da turma
            ]);
  
            const totalChamadas = chamadas.length;
  
            // Filtra alunos com base no CPF do responsável
            const filteredAlunos = turmaAlunos.filter(
              (aluno) => user.role !== 'responsavel' || aluno.nomeResponsavel === user.cpf
            );
  
            // Processa os alunos para incluir presença e treinos
            const alunosData = await Promise.all(
              filteredAlunos.map(async (aluno) => {
                const presencas = chamadas.filter((chamada) =>
                  chamada.presentes.includes(aluno.userId)
                ).length;
  
                const presencaPercentual = totalChamadas > 0 ? ((presencas / totalChamadas) * 100).toFixed(1) : '0.0';
  
                const treinos = await getTreinosPersonalizadosByAlunoId(aluno.userId);
                const totalTreinos = treinos.length;
  
                return {
                  ...aluno,
                  turmaTitle: turma.title,
                  presenca: presencaPercentual,
                  treinosConcluidos: totalTreinos,
                };
              })
            );
  
            return alunosData;
          })
        );
  
        
        setAlunos(turmasData.flat());
      } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
      }
    };
  
    fetchAlunos();
  }, [user.cpf]);

  const renderAlunoItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.headerInfo}>
        <Image source={{ uri: item.avatarUrl || 'https://example.com/default-avatar.png' }} style={styles.avatar} />
        <View>
          <Text style={styles.alunoName}>{item.nome}</Text>
          <Text style={styles.alunoTurma}>Turma: {item.turmaTitle}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="calendar-check" size={30} color="#126046" />
          <Text style={styles.statText}>Presença</Text>
          <Text style={styles.statValue}>{item.presenca}%</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="dumbbell" size={30} color="#126046" />
          <Text style={styles.statText}>Treinos</Text>
          <Text style={styles.statValue}>{item.treinosConcluidos}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.treinosButton}
        onPress={() =>
          router.push({
            pathname: '/dash_treinos2',
            params: { alunoId: item.userId },
          })
        }
      >
        <Text style={styles.treinosButtonText}>Ver Treinos Personalizados</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seu Atleta</Text>
        <Text style={styles.headerSubtitle}>Informações e progresso do aluno</Text>
      </View>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() =>
          router.push({
            pathname: '/signup',
            params: { role: 'atleta', cpf: user.cpf },
          })
        }
      >
        <Text style={styles.signupButtonText}>Cadastrar Novo Atleta</Text>
      </TouchableOpacity>

      <FlatList
        data={alunos}
        renderItem={renderAlunoItem}
        keyExtractor={(item) => `${item.$id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="user" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aguarde seu Atleta ser Cadastrado em uma Turma</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AlunoProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  signupButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#126046',
    borderRadius: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  alunoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  alunoTurma: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  treinosButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#126046',
    alignItems: 'center',
  },
  treinosButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
