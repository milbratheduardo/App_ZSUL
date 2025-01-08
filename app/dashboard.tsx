import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { getAllTurmas, getAlunosByTurmaId, getEventsForCurrentMonth, getAllUsers, getAllEvents } from '@/lib/appwrite';


const Dashboard = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome?.split(' ')[0];
  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [aulasHoje, setAulasHoje] = useState(0);
  const [eventosRecentes, setEventosRecentes] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [totalEventos, setTotalEventos] = useState(0); // Total de eventos
  const [eventosDoMes, setEventosDoMes] = useState(0); // Eventos do mês



  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowPicker(false);
  };

  const formatMonthYear = (date) => {
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  };

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
        const turmas = await getAllTurmas();
        const turmasFiltradas = turmas.filter((turma) =>
          turma.profissionalId.includes(user.userId)
        );
  
        let countAlunos = 0;
        let alunosIds = [];
        for (const turma of turmasFiltradas) {
          const alunos = await getAlunosByTurmaId(turma.$id);
          countAlunos += alunos.length;
          alunosIds.push(...alunos.map((aluno) => aluno.userId)); // Coleta os userId dos alunos
        }
        setTotalAlunos(countAlunos);
  
       
  
        const today = new Date();
        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const todayName = daysOfWeek[today.getDay()];
  
        const aulasHojeCount = turmasFiltradas.filter((turma) =>
          [turma.Dia1, turma.Dia2, turma.Dia3].includes(todayName)
        ).length;
        setAulasHoje(aulasHojeCount);
  
        // Contar alunos do mês
        const fetchAlunosDoMes = async () => {
          const allUsers = await getAllUsers();
         
  
          const selectedMonth = selectedDate.getMonth(); // Mês selecionado (0 = Janeiro)
          const selectedYear = selectedDate.getFullYear(); // Ano selecionado
          
  
          // Filtrar usuários que estão no mês e ano selecionados
          const alunosDoMes = allUsers.filter((user) => {
            const userCreatedDate = user.$createdAt ? new Date(user.$createdAt) : null;
            const isInMonthYear =
              userCreatedDate &&
              userCreatedDate.getMonth() === selectedMonth &&
              userCreatedDate.getFullYear() === selectedYear;
            if (alunosIds.includes(user.userId)) {
              
            }
            return alunosIds.includes(user.userId) && isInMonthYear;
          });
  
          return alunosDoMes.length;
        };
  
        const alunosDoMesCount = await fetchAlunosDoMes();
       
        setAulasHoje(alunosDoMesCount);
  
        // Adicionando fetchEventos
        const fetchEventos = async () => {
          const allEvents = await getAllEvents();
        
        
          const selectedMonth = selectedDate.getMonth() + 1; // Mês selecionado (1 = Janeiro)
          const selectedYear = selectedDate.getFullYear(); // Ano selecionado
      
        
          // Filtrar eventos do mês
          const eventosFiltrados = allEvents.filter((event) => {
            const [day, month, year] = event.Date_event.split('-').map(Number); // Extrai dia, mês, ano
            return month === selectedMonth && year === selectedYear;
          });
        
          // Atualizar estados
          setTotalEventos(allEvents.length); // Total de eventos
          setEventosDoMes(eventosFiltrados.length); // Total de eventos do mês
        };
        
  
        await fetchEventos(); // Chama fetchEventos aqui
  
      } catch (error) {
        
      }
    };
  
    fetchDashboardData();
  }, [user.userId, selectedDate]);
  
  
  
  

  const options = [
    { title: 'Turmas', icon: 'users', route: '/students' },
    { title: 'Alunos', icon: 'user-circle', route: '/alunos_stats' },
    { title: 'Treinos Personalizados', icon: 'calendar', route: '/dash_treinos' },
    { title: 'Metodologias', icon: 'book', route: '/methodologies' },
    { title: 'Eventos e Jogos', icon: 'trophy', route: '/lista_eventos' },
    { title: 'Histórico de Relatórios', icon: 'file-text', route: '/historico_relatorios' }
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
        
        <View style={styles.summaryCard}>
          <TouchableOpacity style={styles.calendarButton} onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={20} color="#126046" />
            <Text style={styles.calendarText}>{formatMonthYear(selectedDate)}</Text>
          </TouchableOpacity>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalAlunos}</Text>
            <Text style={styles.summaryLabel}>Total de Alunos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{aulasHoje}</Text>
            <Text style={styles.summaryLabel}>Alunos do Mês</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{eventosDoMes}</Text>
            <Text style={styles.summaryLabel}>Eventos do Mês</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalEventos}</Text>
            <Text style={styles.summaryLabel}>Total de Eventos</Text>
            </View>
          </View>
        </View>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="calendar"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.optionsList}
        />
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
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#126046',
    marginLeft: 8,
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
    fontSize: 10,
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
});
