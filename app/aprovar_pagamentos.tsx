import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, updateAlunoFatura } from '@/lib/appwrite'; // Função para buscar todos os alunos e atualizar pagamento

const AprovarPagamentos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Função para buscar todos os alunos
  const fetchAlunos = async () => {
    try {
      const alunosData = await getAllAlunos();
      // Filtra alunos cujo pagamento seja 1 (esperando aprovação)
      const alunosComPagamentoPendente = alunosData.filter((aluno) => aluno.pagamento === '1');
      setAlunos(alunosComPagamentoPendente);
      setFilteredAlunos(alunosComPagamentoPendente.slice(0, 10)); // Inicia com 10 alunos
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aprovar pagamento (atualiza para pagamento == '2')
  const aprovarPagamento = async (alunoId) => {
    try {
      await updateAlunoFatura(alunoId, { pagamento: '2' });
      Alert.alert('Sucesso', 'Pagamento aprovado com sucesso!');
      fetchAlunos(); // Atualiza a lista de alunos
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aprovar o pagamento.');
    }
  };

  // Função para negar pagamento (atualiza para pagamento == null)
  const negarPagamento = async (alunoId) => {
    try {
      await updateAlunoFatura(alunoId, { pagamento: null });
      Alert.alert('Sucesso', 'Pagamento negado com sucesso!');
      fetchAlunos(); // Atualiza a lista de alunos
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível negar o pagamento.');
    }
  };

  // Função para renderizar cada aluno
  const renderAluno = ({ item }) => (
    <View style={{
      padding: 16,
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginBottom: 16,
      marginHorizontal: 16,
      position: 'relative',
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{item.username}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.createdByUsername}</Text>


      {/* Texto de status de pagamento */}
      <Text style={{
        position: 'absolute',
        top: 10,
        right: 10,
        color: 'blue',
        fontWeight: 'bold',
      }}>Esperando Aprovação</Text>

      {/* Botões para aprovar ou negar pagamento */}
      <CustomButton
        title="Aprovar Pagamento"
        handlePress={() => aprovarPagamento(item.$id)}
        containerStyles="p-3 mt-5"
      />
      <CustomButton
        title="Negar Pagamento"
        handlePress={() => negarPagamento(item.$id)}
        containerStyles="p-3 mt-3 bg-red-500"
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.$id}
        renderItem={renderAluno}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, textAlign: 'center' }}>Nenhum pagamento pendente</Text>
          </View>
        )}
        onRefresh={fetchAlunos}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

export default AprovarPagamentos;
