import { View, Text, FlatList, Image, RefreshControl, Alert, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllTurmas, deletarTurma } from '@/lib/appwrite';
import EmptyState from '@/components/EmptyState';
import TurmasCard from '@/components/TurmaCard';
import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { getAllAlunos } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';



const Turmas = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const { user } = useGlobalContext(); 
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 


  const today = new Date();
  const currentDate = today.getDate();
  const currentDay = today.getDay();
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const [selectedDay, setSelectedDay] = useState(daysOfWeek[currentDay]);

  const generateDays = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      days.push({
        id: i + 4,
        day: daysOfWeek[date.getDay()],
        date: date.getDate()
      });
    }
    return days;
  };

  const days = generateDays();

  const fetchData = async (day = selectedDay) => {
    setIsLoading(true);
    try {
      if (user.admin === 'admin') {
        const todasTurmas = await getAllTurmas();
        const filteredData = todasTurmas.filter(
          turma =>
            turma.Dia1 === day || turma.Dia2 === day || turma.Dia3 === day // Filtro para os dias
        );
        setData(filteredData);
      } else if (user.role === 'profissional') {
        // Lógica para profissionais
        const response = await getAllTurmas();
        const filteredData = response.filter(
          turma =>
            turma.profissionalId.includes(user.userId) && // Verifica se o user.userId está contido em turma.profissionalId
            (turma.Dia1 === day || turma.Dia2 === day || turma.Dia3 === day) // Filtro para os dias
        );
        setData(filteredData);
      } else if (user.role === 'responsavel') {
        // Lógica para responsáveis
        const alunos = await getAllAlunos();
        const responsavelAlunos = alunos.filter(aluno => aluno.nomeResponsavel === user.cpf);
        const turmaIds = [...new Set(responsavelAlunos.map(aluno => aluno.turmaId).filter(Boolean))];
        const todasTurmas = await getAllTurmas();
        const filteredData = todasTurmas.filter(
          turma =>
            turmaIds.includes(turma.$id) && // Verifica se a turma está na lista de IDs das turmas dos alunos
            (turma.Dia1 === day || turma.Dia2 === day || turma.Dia3 === day) // Filtro para os dias
        );
        setData(filteredData);
      } else if (user.role === 'atleta') {
        // Lógica para atletas
        const alunos = await getAllAlunos();
        const atletaData = alunos.find(aluno => aluno.userId === user.userId); // Busca o próprio atleta
        if (atletaData) {
          const todasTurmas = await getAllTurmas();
          const filteredData = todasTurmas.filter(
            turma =>
              turma.$id === atletaData.turmaId && // Filtro para mostrar apenas a turma do atleta
              (turma.Dia1 === day || turma.Dia2 === day || turma.Dia3 === day)
          );
          setData(filteredData);
        } else {
          setData([]); // Caso o atleta não tenha uma turma associada
        }
      }
    } catch (error) {
      setErrorMessage(`Erro.`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDay]);

  const firstName = user.nome.split(' ')[0];

  const handleTurmaPress = (turma) => {
    setSelectedTurma(turma);
  };

  const renderDayItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedDay(item.day)}>
      <View style={{
        padding: 10,
        borderRadius: 5,
        backgroundColor: selectedDay === item.day ? '#1E3A8A' : '#f0f0f0',
        marginHorizontal: 1,
        alignItems: 'center',
        minWidth: 50,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: selectedDay === item.day ? '#fff' : '#000' }}>
          {item.date}
        </Text>
        <Text style={{ color: selectedDay === item.day ? '#fff' : '#000', fontSize: 10 }}>
          {item.day}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TurmasCard
            turma={{
              turmaId: item.$id,
              title: item.title,
              Qtd_Semana: item.Qtd_Semana,
              Dia1: item.Dia1,
              Dia2: item.Dia2,
              Dia3: item.Dia3,
              Local: item.Local,
              Sub: item.Sub,
              MaxAlunos: item.MaxAlunos,
              Horario_de_inicio: item.Horario_de_inicio,
              Horario_de_termino: item.Horario_de_termino,
            }}
            onPress={() => handleTurmaPress(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-2">
              <View>
                <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
                <Text className="text-2xl font-psemibold text-verde">{firstName}</Text>
              </View>
              <View className="mt-1.5">
                <Image source={images.escola_sp_transparente} className="w-[115px] h-[90px]" />
              </View>
            </View>
            <Text className="text-primary text-lg font-pregular mb-1">
                Selecione uma Data
            </Text>
            <FlatList
              data={days}
              horizontal
              keyExtractor={item => item.id.toString()}
              renderItem={renderDayItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />

            <View className="w-full flex-row items-center justify-between pt-5 pb-2">
              <Text className="text-primary text-lg font-pregular mb-1">
                Turmas Disponíveis
              </Text>
              {user.admin === 'admin' && (
                <CustomButton
                  title="Criar Turma"
                  handlePress={() => router.push('/cadastro_turma')}
                  containerStyles="ml-4 p-3"
                />
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Turma Encontrada"
            subtitle="Não foi criada nenhuma turma"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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

export default Turmas;