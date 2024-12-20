import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Picker } from '@react-native-picker/picker';
import { getAllTurmas, getAlunosByTurmaId } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StudentsStats = () => {
  const { user } = useGlobalContext();
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTurmas = await getAllTurmas();
        
        // Verifica se o usuário é admin
        const userTurmas = user.admin === 'admin'
          ? allTurmas // Carrega todas as turmas para admin
          : allTurmas.filter((turma) => turma.profissionalId.includes(user.userId)); // Filtra turmas relacionadas ao profissional
        
        setTurmas(userTurmas);
  
        const alunosData = [];
        for (const turma of userTurmas) {
          const turmaAlunos = await getAlunosByTurmaId(turma.$id);
          turmaAlunos.forEach((aluno) => {
            alunosData.push({ ...aluno, turmaTitle: turma.title });
          });
        }
        setAlunos(alunosData);
      } catch (error) {
        setErrorMessage(`Erro ao buscar dados.`);
        setShowErrorModal(true);
      }
    };
  
    fetchData();
  }, [user.userId, user.admin]); // Adicionado user.admin como dependência
  

  const handleTurmaChange = (turmaId) => {
    setSelectedTurma(turmaId);

    if (!turmaId) {
      // Não mostrar alunos se nenhuma turma for selecionada
      setFilteredAlunos([]);
      setSelectedAtleta(null);
      return;
    }

    // Filtrar alunos pela turma selecionada
    const filtered = alunos.filter((aluno) => aluno.turmaId === turmaId);
    setFilteredAlunos(filtered);
    setSelectedAtleta(null);
  };

  const handleAtletaSelect = (aluno) => {
    // Se o mesmo atleta for selecionado novamente, fecha o detalhamento
    if (selectedAtleta?.$id === aluno.$id) {
      setSelectedAtleta(null);
    } else {
      setSelectedAtleta(aluno);
    }
  };

  const renderAtletaDetails = (atleta) => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Detalhes do Atleta</Text>
      <ScrollView style={styles.infoContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{atleta.nome}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>WhatsApp</Text>
          <Text style={styles.value}>{atleta.whatsapp}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Posição</Text>
          <Text style={styles.value}>{atleta.posicao}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Pé Dominante</Text>
          <Text style={styles.value}>{atleta.peDominante}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Altura</Text>
          <Text style={styles.value}>{atleta.altura} cm</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{atleta.peso} kg</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.value}>{atleta.objetivo}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <Text style={styles.value}>{atleta.birthDate}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Alergias</Text>
          <Text style={styles.value}>{atleta.alergias || 'Nenhuma'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Condições Médicas</Text>
          <Text style={styles.value}>{atleta.condicoesMedicas || 'Nenhuma'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Lesões Anteriores</Text>
          <Text style={styles.value}>{atleta.lesoesAnteriores || 'Nenhuma'}</Text>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.pageTitle}>Informações dos Atletas</Text>

        {/* Picker de Turmas */}
        <Picker
          selectedValue={selectedTurma}
          onValueChange={(value) => handleTurmaChange(value)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma turma" value={null} />
          {turmas.map((turma) => (
            <Picker.Item key={turma.$id} label={turma.title} value={turma.$id} />
          ))}
        </Picker>

        {/* Lista de Atletas */}
        {filteredAlunos.map((aluno) => (
          <TouchableOpacity
            key={aluno.$id}
            style={[
              styles.alunoCard,
              selectedAtleta?.$id === aluno.$id && styles.alunoCardSelected,
            ]}
            onPress={() => handleAtletaSelect(aluno)}
          >
            <Text style={styles.alunoName}>{aluno.nome}</Text>
          </TouchableOpacity>
        ))}

        {/* Detalhes do Atleta Selecionado */}
        {selectedAtleta && renderAtletaDetails(selectedAtleta)}
      </ScrollView>
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

export default StudentsStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  screenContent: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#126046',
  },
  picker: {
    marginVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 1,
  },
  alunoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alunoCardSelected: {
    backgroundColor: '#DFF6DD',
    borderWidth: 1,
    borderColor: '#126046',
  },
  alunoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#126046',
  },
  detailsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    marginBottom: 10,
  },
  infoContainer: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
});
