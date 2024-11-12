import React,  { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import { getAllTurmas, getAlunosByTurmaId, getEventsForCurrentMonth } from '@/lib/appwrite';

const Dashboard = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome?.split(' ')[0];
  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [aulasHoje, setAulasHoje] = useState(0);
  const [eventosRecentes, setEventosRecentes] = useState(0);


  useEffect(() => {
    const fetchEventosRecentes = async () => {
      const count = await getEventsForCurrentMonth();
      setEventosRecentes(count);
    };

    fetchEventosRecentes();
  }, []);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obter todas as turmas
        const turmas = await getAllTurmas();
        
        // Filtrar turmas para aquelas que têm o user.userId no campo profissionalId
        const turmasFiltradas = turmas.filter((turma) => turma.profissionalId.includes(user.userId));

        // Total de Alunos
        let countAlunos = 0;
        for (const turma of turmasFiltradas) {
          const alunos = await getAlunosByTurmaId(turma.$id);
          countAlunos += alunos.length;
        }
        setTotalAlunos(countAlunos);

        // Contagem de Aulas Hoje
        const today = new Date();
        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const todayName = daysOfWeek[today.getDay()];

        const aulasHojeCount = turmasFiltradas.filter((turma) =>
          [turma.Dia1, turma.Dia2, turma.Dia3].includes(todayName)
        ).length;

        setAulasHoje(aulasHojeCount);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      }
    };

    fetchDashboardData();
  }, [user.userId]);


  const options = [
    { title: 'Alunos', icon: 'users', route: '/students' },
    { title: 'Aulas e Treinos', icon: 'calendar', route: '/classes-trainings' },
    { title: 'Metodologias', icon: 'book', route: '/methodologies' },
    { title: 'Eventos e Jogos', icon: 'trophy', route: '/events-teams' },
    
  ];

  const renderOption = ({ item }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={() => router.push(item.route)}>
      <View style={styles.optionContent}>
        <Icon name={item.icon} size={24} color="#333" style={styles.optionIcon} />
        <Text style={styles.optionText}>{item.title}</Text>
      </View>
      <Icon name="angle-right" size={16} color="#888" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
              <Text style={styles.userInfo}>{user?.nome} - Treinador de Futebol</Text>
              <Text style={styles.userInfo}>Dashboard</Text>
            </View>
          </View>
          <Icon name="shield" size={50} color="#126046" style={styles.teamLogo} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContent}>
        {/* Resumo de Informações */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalAlunos}</Text>
              <Text style={styles.summaryLabel}>Total de Alunos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{aulasHoje}</Text>
              <Text style={styles.summaryLabel}>Aulas Hoje</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{eventosRecentes}</Text>
              <Text style={styles.summaryLabel}>Eventos Recentes</Text>
            </View>
          </View>
        </View>

        {/* Lista de Ações Rápidas */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.optionsList}
        />

        {/* Gráfico Fictício de Posições de Atletas 
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Posições de Atletas</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>[Gráfico de Posições Placeholder]</Text>
          </View>
        </View>*/}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#126046',
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  teamLogo: {
    marginLeft: 16,
  },
  dashboardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#126046',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
    color: '#126046',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  arrowIcon: {
    color: '#126046',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chartPlaceholder: {
    backgroundColor: '#E0E0E0',
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    color: '#666',
    fontSize: 16,
  },
});
