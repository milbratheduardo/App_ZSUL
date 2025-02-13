import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { getAllAlunos, addAlunoToTurma, getTurmaById } from '@/lib/appwrite'; 
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CampoFutebolSVG = ({ turmaId, handlePressPosition }) => {
  // Mapeamento das posições com os valores corretos para o Picker
  const jogadores = [
    { id: 0, position: 'QQ', abbreviation: 'QQ', cx: 55, cy: 90, value: 'qualquer' },
    { id: 1, position: 'Goleiro', abbreviation: 'G', cx: 30, cy: 10, value: 'goleiro' },
    { id: 2, position: 'Lateral Esquerdo', abbreviation: 'LE', cx: 45, cy: 30, value: 'lateral-esquerdo' },
    { id: 3, position: 'Zagueiro Esquerdo', abbreviation: 'ZE', cx: 25, cy: 30, value: 'zagueiro-central' },
    { id: 4, position: 'Zagueiro Direito', abbreviation: 'ZD', cx: 35, cy: 30, value: 'zagueiro-central' },
    { id: 5, position: 'Lateral Direito', abbreviation: 'LD', cx: 15, cy: 30, value: 'lateral-direito' },
    { id: 6, position: 'Volante', abbreviation: 'V', cx: 30, cy: 50, value: 'volante' },
    { id: 7, position: 'Meia Central', abbreviation: 'MC', cx: 40, cy: 60, value: 'meia-central' },
    { id: 8, position: 'Meia Ofensivo', abbreviation: 'MO', cx: 20, cy: 60, value: 'meia-ofensivo' },
    { id: 9, position: 'Ponta Esquerda', abbreviation: 'PE', cx: 40, cy: 80, value: 'ponta-esquerda' },
    { id: 10, position: 'Centroavante', abbreviation: 'CA', cx: 30, cy: 85, value: 'centroavante' },
    { id: 11, position: 'Ponta Direita', abbreviation: 'PD', cx: 20, cy: 80, value: 'ponta-direita' },
  ];

  return (
    <Svg width="100%" height="60%" viewBox="0 0 60 110" style={styles.campo}>
      {/* Campo de Futebol */}
      <Rect x="0" y="5" width="60" height="100" fill="#4CAF50" rx="4" />
      
      {/* Linha Central */}
      <Line x1="0" y1="55" x2="60" y2="55" stroke="white" strokeWidth="0.5" />

      {/* Círculo Central */}
      <Circle cx="30" cy="55" r="5" stroke="white" strokeWidth="0.5" fill="none" />

      {/* Área de Gol Superior */}
      <Rect x="20" y="5" width="20" height="10" stroke="white" strokeWidth="0.5" fill="none" />
      <Rect x="25" y="5" width="10" height="5" stroke="white" strokeWidth="0.5" fill="none" />
      <Circle cx="30" cy="12" r="0.5" fill="white" />

      {/* Área de Gol Inferior */}
      <Rect x="20" y="95" width="20" height="10" stroke="white" strokeWidth="0.5" fill="none" />
      <Rect x="25" y="100" width="10" height="5" stroke="white" fill="none" />
      <Circle cx="30" cy="98" r="0.5" fill="white" />

      {/* Círculos de Jogadores Estilizados */}
      {jogadores.map((jogador) => (
        <React.Fragment key={jogador.id}>
          <Circle
            cx={jogador.cx}
            cy={jogador.cy}
            r="3.5"
            fill="#FFD700"
            stroke="#000"
            strokeWidth="0.5"
            shadowOpacity={0.2}
            shadowRadius={2}
            shadowOffset={{ width: 1, height: 1 }}
            onPressIn={() => handlePressPosition(jogador.value)}
          />
          <SvgText
            x={jogador.cx + 0.5}
            y={jogador.cy + 1.2} // Ajuste para centralizar o texto
            fontSize="2.5"
            fontWeight="bold"
            fill="black"
            textAnchor="middle"
          >
            {jogador.abbreviation}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
};

const CadastrarAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [turma, setTurma] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const { turmaId, turmaTitle } = useLocalSearchParams();

  const handlePressPosition = (position) => {
    router.push({
      pathname: '/escolherAtleta',
      params: { position, turmaId },
    });
  };

  useEffect(() => {
    fetchAlunos();
    fetchTurma();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      const alunosComTurmaIdNull = alunosData.filter((aluno) => aluno.turmaId === null);
      setAlunos(alunosComTurmaIdNull);
      setFilteredAlunos(alunosComTurmaIdNull.slice(0, 10));
    } catch (error) {
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
    }
  };

  

  const fetchTurma = async () => {
    try {
      const turmaData = await getTurmaById(turmaId);
      setTurma(turmaData);
    } catch (error) {
      setErrorMessage(`Erro ao buscar turma.`);
      setShowErrorModal(true);
    }
  };

  const handleSelectAluno = (userId) => {
    if (selectedAlunos.includes(userId)) {
      setSelectedAlunos(selectedAlunos.filter((selectedId) => selectedId !== userId));
    } else {
      setSelectedAlunos([...selectedAlunos, userId]);
    }
  };

  const handleSave = async () => {
    try {
      for (const alunoId of selectedAlunos) {
        await addAlunoToTurma(alunoId, turmaId);
      }
      setSuccessMessage('Alunos cadastrados com sucesso!');
      setShowSuccessModal(true);
      router.replace(`/turmas`);
    } catch (error) {
      setErrorMessage(`Erro, não foi possível cadastrar os alunos.`);
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Inserir Atleta</Text>
      {turma ? (
        <TurmasCard2
          turma={{
            turmaId: turma.$id,
            title: turma.title,
            Horario_de_inicio: turma.Horario_de_inicio,
            Horario_de_termino: turma.Horario_de_termino,
            Local: turma.Local,
            Dia1: turma.Dia1,
            Dia2: turma.Dia2,
            Dia3: turma.Dia3,
            Sub: turma.Sub,
            MaxAlunos: turma.MaxAlunos,
          }}
        />
      ) : (
        <Text>Carregando informações da turma...</Text>
      )}

        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', fontFamily: 'YourCustomFont' }}>
          Selecione a Posição
        </Text>

        {/* Campo de Futebol SVG */}
        <CampoFutebolSVG turmaId={turmaId} handlePressPosition={handlePressPosition} />

        
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
              style={styles.closeButton}
              onPress={() => {
                setShowSuccessModal(false);
                
              }}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  campo: {
    marginVertical: 5,
    borderRadius: 100,
    borderWidth: 50,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  alunoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  selectedAlunoItem: {
    backgroundColor: '#e0ffe0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  alunoCheck: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
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
  closeButton: {
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

export default CadastrarAlunos;
