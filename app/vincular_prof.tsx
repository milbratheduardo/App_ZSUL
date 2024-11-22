import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Picker } from '@react-native-picker/picker';
import { getAllTurmas, getAllProfissionais, updateTurmaProfissionais } from '@/lib/appwrite'; // Substitua pelas funções reais

const VincularProf = () => {
  const { user } = useGlobalContext();
  const [turmas, setTurmas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [filteredProfissionais, setFilteredProfissionais] = useState([]);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const allTurmas = await getAllTurmas();
        setTurmas(allTurmas);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
      }
    };

    fetchTurmas();
  }, []);

  const handleTurmaChange = async (turmaId) => {
    setSelectedTurma(turmaId);

    if (!turmaId) {
      setFilteredProfissionais([]);
      return;
    }

    try {
      // Buscar a turma selecionada
      const turmaSelecionada = turmas.find((turma) => turma.$id === turmaId);

      if (!turmaSelecionada) {
        console.error('Turma selecionada não encontrada');
        return;
      }

      // Buscar todos os profissionais
      const allProfissionais = await getAllProfissionais();

      // Filtrar os profissionais que não estão vinculados à turma
      const naoVinculados = allProfissionais.filter(
        (profissional) => !turmaSelecionada.profissionalId.includes(profissional.userId)
      );

      setFilteredProfissionais(naoVinculados);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  const handleVincular = async (profissionalId) => {
    try {
      if (!selectedTurma) {
        Alert.alert('Erro', 'Nenhuma turma selecionada.');
        return;
      }

      // Buscar a turma selecionada
      const turma = turmas.find((t) => t.$id === selectedTurma);

      if (!turma) {
        Alert.alert('Erro', 'Turma selecionada não encontrada.');
        return;
      }

      // Atualizar a coluna profissionalId com o novo profissional
      const updatedProfissionalId = [...turma.profissionalId, profissionalId];

      // Enviar atualização para o banco de dados
      await updateTurmaProfissionais(selectedTurma, updatedProfissionalId);

      Alert.alert('Sucesso', 'Profissional vinculado com sucesso!');

      // Atualizar a lista de profissionais não vinculados localmente
      setFilteredProfissionais((prev) =>
        prev.filter((profissional) => profissional.userId !== profissionalId)
      );

      // Atualizar a lista de turmas localmente
      setTurmas((prevTurmas) =>
        prevTurmas.map((t) =>
          t.$id === selectedTurma
            ? { ...t, profissionalId: updatedProfissionalId }
            : t
        )
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível vincular o profissional.');
      console.error('Erro ao vincular profissional:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.pageTitle}>Vincular Profissional a Turma</Text>

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

        {/* Lista de Profissionais Não Vinculados */}
        {filteredProfissionais.map((profissional) => (
          <TouchableOpacity
            key={profissional.userId}
            style={styles.profissionalCard}
            onPress={() => handleVincular(profissional.userId)}
          >
            <Text style={styles.profissionalName}>{profissional.nome}</Text>
            <Text style={styles.profissionalInfo}>{profissional.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VincularProf;

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
  profissionalCard: {
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
  profissionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#126046',
  },
  profissionalInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
