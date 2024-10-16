import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAlunos, getAllUsers } from '@/lib/appwrite'; // Funções necessárias
import { useLocalSearchParams } from 'expo-router'; // Para pegar os parâmetros passados via navegação

const VerConfirmados = () => {
  const [alunos, setAlunos] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredConfirmados, setFilteredConfirmados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pegando os parâmetros passados via navegação
  const { confirmados: confirmadosParam, eventTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar todos os alunos e usuários
      const allAlunos = await getAllAlunos();
      const allUsers = await getAllUsers();

      setAlunos(allAlunos);
      setUsers(allUsers);

      // Definir os confirmados com base nos IDs fornecidos
      if (confirmadosParam) {
        const confirmadosIds = confirmadosParam.split(',');

        // Filtrar os alunos e usuários confirmados
        const confirmadosAlunos = allAlunos.filter((aluno) => confirmadosIds.includes(aluno.$id));
        const confirmadosUsers = allUsers.filter((user) => confirmadosIds.includes(user.$id));

        // Concatenar ambos na lista final
        setFilteredConfirmados([...confirmadosAlunos, ...confirmadosUsers]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setFilteredConfirmados([...alunos, ...users].filter((item) => confirmadosParam.split(',').includes(item.$id)));
    } else {
      const filtered = [...alunos, ...users].filter(
        (item) =>
          item.username.toLowerCase().includes(text.toLowerCase()) &&
          confirmadosParam.split(',').includes(item.$id)
      );
      setFilteredConfirmados(filtered);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Confirmados para {eventTitle}
      </Text>

      <TextInput
        placeholder="Buscar aluno/usuário"
        value={searchQuery}
        onChangeText={handleSearch}
        style={{
          padding: 10,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 5,
          marginBottom: 10,
        }}
      />

      <FlatList
        data={filteredConfirmados}
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
            <Text style={{ fontSize: 18 }}>{'✓'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default VerConfirmados;
