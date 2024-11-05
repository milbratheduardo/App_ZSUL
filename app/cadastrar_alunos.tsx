import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { getAllAlunos, addAlunoToTurma } from '@/lib/appwrite'; 
import { useLocalSearchParams, router } from 'expo-router';

const CampoFutebolSVG = () => {
  const handlePressPosition = (position) => {
    Alert.alert(`Posição: ${position}`, `Você clicou na posição ${position}`);
  };

  const jogadores = [
    { id: 0, position: 'QQ', abbreviation: 'QQ', cx: 55, cy: 90 },
    { id: 1, position: 'Goleiro', abbreviation: 'G', cx: 30, cy: 10 },
    { id: 2, position: 'Lateral Esquerdo', abbreviation: 'LE', cx: 15, cy: 30 },
    { id: 3, position: 'Zagueiro Esquerdo', abbreviation: 'ZE', cx: 25, cy: 30 },
    { id: 4, position: 'Zagueiro Direito', abbreviation: 'ZD', cx: 35, cy: 30 },
    { id: 5, position: 'Lateral Direito', abbreviation: 'LD', cx: 45, cy: 30 },
    { id: 6, position: 'Volante', abbreviation: 'V', cx: 30, cy: 50 },
    { id: 7, position: 'Meia Esquerda', abbreviation: 'ME', cx: 20, cy: 60 },
    { id: 8, position: 'Meia Direita', abbreviation: 'MD', cx: 40, cy: 60 },
    { id: 9, position: 'Ponta Esquerda', abbreviation: 'PE', cx: 20, cy: 80 },
    { id: 10, position: 'Centroavante', abbreviation: 'CA', cx: 30, cy: 85 },
    { id: 11, position: 'Ponta Direita', abbreviation: 'PD', cx: 40, cy: 80 },
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
      <Rect x="25" y="100" width="10" height="5" stroke="white" strokeWidth="0.5" fill="none" />
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
            onPressIn={() => handlePressPosition(jogador.position)}
          />
          <SvgText
            x={jogador.cx}
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
  const [searchQuery, setSearchQuery] = useState('');

  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      const alunosComTurmaIdNull = alunosData.filter((aluno) => aluno.turmaId === null);
      setAlunos(alunosComTurmaIdNull);
      setFilteredAlunos(alunosComTurmaIdNull.slice(0, 10));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos.slice(0, 10));
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
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
      Alert.alert('Sucesso', 'Alunos cadastrados com sucesso');
      router.replace(`/turmas`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar os alunos');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Inserir Atleta</Text>

        <TurmasCard2
          turma={{
            turmaId,
            title: turmaTitle,
            Horario_de_inicio: '08:00',
            Horario_de_termino: '10:00',
            Local: 'Campo de Treinamento',
            Dia1: 'Segunda-feira',
            Dia2: 'Quarta-feira',
            Dia3: 'Sexta-feira',
            MaxAlunos: 20,
          }}
        />

        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', fontFamily: 'YourCustomFont' }}>
          Selecione a Posição
        </Text>

        {/* Campo de Futebol SVG */}
        <CampoFutebolSVG />

        <FlatList
          data={filteredAlunos}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.alunoItem,
                selectedAlunos.includes(item.userId) && styles.selectedAlunoItem,
              ]}
              onPress={() => handleSelectAluno(item.userId)}
            >
              <Text style={styles.alunoText}>{item.nome}</Text>
              <Text style={styles.alunoCheck}>
                {selectedAlunos.includes(item.userId) ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          )}
        />
{/* Campo de Futebol SVG 
        <View style={styles.buttonContainer}>
          <CustomButton title="Salvar Seleção" handlePress={handleSave} />
        </View>*/}
      </ScrollView>
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
});

export default CadastrarAlunos;
