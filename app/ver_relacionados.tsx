import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, updateEventConfirmados } from '@/lib/appwrite';
import { useLocalSearchParams, router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';

const VerRelacionados = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useGlobalContext();

  const { confirmados: confirmadosParam, eventTitle, eventId } = useLocalSearchParams();
  console.log('ConfirmadoParam: ', confirmadosParam);

  useEffect(() => {
    // Define os alunos confirmados a partir dos parâmetros na inicialização
    if (confirmadosParam) {
      const confirmadosIds = confirmadosParam.split(',');
      setConfirmados(confirmadosIds);
    }
    fetchAlunos();
  }, []);

  useEffect(() => {
    // Atualiza `filteredAlunos` com base em `confirmados` assim que `confirmados` e `alunos` estiverem prontos
    const updatedFilteredAlunos = alunos.map((aluno) => ({
      ...aluno,
      selected: confirmados.includes(aluno.userId),
    }));
    setFilteredAlunos(updatedFilteredAlunos);
  }, [confirmados, alunos]);

  const fetchAlunos = async () => {
    try {
      const allAlunos = await getAllAlunos();
      setAlunos(allAlunos);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSelectAluno = (userId) => {
    if (confirmados.includes(userId)) {
      setConfirmados(confirmados.filter((confirmadoId) => confirmadoId !== userId));
    } else {
      setConfirmados([...confirmados, userId]);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos);
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
    }
  };

  const handleSave = async () => {
    try {
      await updateEventConfirmados(eventId, confirmados);
      Alert.alert('Sucesso', 'Lista de confirmados atualizada com sucesso');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  const isEditable = user?.role === 'admin' || user?.role === 'profissional';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relacionados para {eventTitle}</Text>
      </View>

      <TextInput
        placeholder="Buscar atleta"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      <Text style={styles.subtitle}>Selecione apenas os presentes</Text>

      <ScrollView style={styles.alunoList}>
        {filteredAlunos.map((item) => (
          <TouchableOpacity
            key={item.userId}
            disabled={!isEditable}
            style={[
              styles.alunoContainer,
              item.selected && styles.alunoSelecionado,
            ]}
            onPress={() => isEditable && handleSelectAluno(item.userId)}
          >
            <Text style={styles.alunoText}>{item.nome}</Text>
            <Text style={styles.checkmark}>
              {item.selected ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isEditable && (
        <View style={styles.buttonContainer}>
          <CustomButton
            containerStyles="px-3 py-2 rounded-lg w-[120px] h-[40px] justify-center items-center"
            title="Salvar"
            handlePress={handleSave}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alunoList: {
    flex: 1,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  alunoSelecionado: {
    backgroundColor: '#d0f0d0',
  },
  alunoText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#126046',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default VerRelacionados;
