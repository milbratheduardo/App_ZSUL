import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import CustomButton from '@/components/CustomButton';
import TurmasCard2 from '@/components/TurmaCard2';
import { getAllAlunos, addAlunoToTurma } from '@/lib/appwrite'; 
import { useLocalSearchParams, router } from 'expo-router';

// Componente de campo de futebol em SVG, com formação 4-3-3
const CampoFutebolSVG = () => {
  const handlePressPosition = (position) => {
    Alert.alert(`Posição: ${position}`, `Você clicou na posição ${position}`);
  };

  // Definindo as posições dos jogadores para a formação 4-3-3
  const jogadores = [
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
    <Svg width="100%" height="60%" viewBox="0 0 60 100" style={styles.campo}>
      {/* Campo */}
      <Rect x="0" y="0" width="60" height="100" fill="#005500" />
      {/* Linha central */}
      <Line x1="0" y1="50" x2="60" y2="50" stroke="white" strokeWidth="0.5" />
      {/* Círculo central */}
      <Circle cx="30" cy="50" r="5" stroke="white" strokeWidth="0.5" fill="none" />
      {/* Área de gol superior */}
      <Rect x="20" y="0" width="20" height="10" stroke="white" strokeWidth="0.5" fill="none" />
      {/* Pequena área superior */}
      <Rect x="25" y="0" width="10" height="5" stroke="white" strokeWidth="0.5" fill="none" />
      {/* Ponto de pênalti superior */}
      <Circle cx="30" cy="7" r="0.5" fill="white" />
      {/* Área de gol inferior */}
      <Rect x="20" y="90" width="20" height="10" stroke="white" strokeWidth="0.5" fill="none" />
      {/* Pequena área inferior */}
      <Rect x="25" y="95" width="10" height="5" stroke="white" strokeWidth="0.5" fill="none" />
      {/* Ponto de pênalti inferior */}
      <Circle cx="30" cy="93" r="0.5" fill="white" />

      {/* Círculos para jogadores, interativos */}
      {jogadores.map((jogador) => (
        <React.Fragment key={jogador.id}>
          <Circle
            cx={jogador.cx}
            cy={jogador.cy}
            r="3" // Aumentei um pouco o tamanho para encaixar o texto
            fill="#ffcc00"
            onPressIn={() => handlePressPosition(jogador.position)}
          />
          <SvgText
            x={jogador.cx}
            y={jogador.cy + 1} // Ajuste para centralizar o texto no círculo
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
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
       Inserir Atleta
      </Text>

      {/* Renderizando o TurmasCard2 */}
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

      {/* Campo de Futebol SVG Orientado Verticalmente */}
      <CampoFutebolSVG />

      <TextInput
        placeholder="Buscar aluno"
        value={searchQuery}
        onChangeText={handleSearch}
        style={{ padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10 }}
      />

      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: selectedAlunos.includes(item.userId) ? 'lightgray' : 'white',
            }}
            onPress={() => handleSelectAluno(item.userId)}
          >
            <Text>{item.nome}</Text>
            <Text style={{ fontSize: 18 }}>{selectedAlunos.includes(item.userId) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <CustomButton 
          containerStyles='rounded-lg w-[180px] h-[40px]' 
          title="Salvar Seleção" 
          handlePress={handleSave} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  campo: {
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default CadastrarAlunos;
