import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router'; // Hook para pegar parâmetros
import { getAlunosById } from '@/lib/appwrite'; // Função para buscar alunos por IDs

const VerRelacionados = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pegando os parâmetros passados via navegação
  const { confirmados, eventTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunosConfirmados();
  }, [confirmados]);

  console.log('Confirmados: ', confirmados);
  console.log('Title: ', eventTitle);

  const fetchAlunosConfirmados = async () => {
    try {
      const alunosConfirmados = [];
      const confirmadosIds = confirmados.split(','); // Dividindo a string de IDs em um array
  
      console.log('Lista de IDs de confirmados:', confirmadosIds);
  
      // Buscar os alunos confirmados com base nos IDs fornecidos
      for (const alunoId of confirmadosIds) {
        console.log('Buscando aluno com ID:', alunoId);
  
        const alunoData = await getAlunosById(alunoId); // Busca o aluno pelo ID
        console.log('Dados do aluno retornados:', alunoData);
  
        if (alunoData) {
          alunosConfirmados.push(alunoData); // Adiciona o aluno retornado
        } else {
          console.error('Nenhum aluno encontrado para o ID:', alunoId);
        }
      }
  
      if (alunosConfirmados.length === 0) {
        console.warn('Nenhum aluno confirmado foi encontrado.');
      }
  
      setAlunos(alunosConfirmados);
      setFilteredAlunos(alunosConfirmados.slice(0, 10)); // Mostra os primeiros 10
    } catch (error) {
      console.error('Erro ao buscar alunos confirmados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos confirmados');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredAlunos(alunos.slice(0, 10));
    } else {
      const filtered = alunos.filter((aluno) =>
        aluno.username.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAlunos(filtered);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Relacionados para {eventTitle}
      </Text>

      <TextInput
        placeholder="Buscar aluno"
        value={searchQuery}
        onChangeText={handleSearch}
        style={{ padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10 }}
      />

      <FlatList
        data={filteredAlunos}
        keyExtractor={(item) => item.$id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: 'white',
            }}
          >
            <Text>{item.username}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default VerRelacionados;
