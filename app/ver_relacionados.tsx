import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { getAllAlunos, updateEventConfirmados } from '@/lib/appwrite'; // Funções necessárias
import { useLocalSearchParams, router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';


const VerRelacionados = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useGlobalContext();

  // Pegando os parâmetros passados via navegação
  const { confirmados: confirmadosParam, eventTitle, eventId } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      // Buscar todos os alunos
      const allAlunos = await getAllAlunos();
      setAlunos(allAlunos);
      setFilteredAlunos(allAlunos.slice(0, 10));

      // Definir os alunos confirmados com base nos IDs fornecidos
      if (confirmadosParam) {
        const confirmadosIds = confirmadosParam.split(',');
        setConfirmados(confirmadosIds);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    }
  };

  const handleSelectAluno = (id) => {
    if (confirmados.includes(id)) {
      setConfirmados(confirmados.filter((confirmadoId) => confirmadoId !== id));
    } else {
      setConfirmados([...confirmados, id]);
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

  const handleSave = async () => {
    try {
      await updateEventConfirmados(eventId, confirmados);
      Alert.alert('Sucesso', 'Lista de confirmados atualizada com sucesso');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  const isEditable = user?.role === 'admin' || user?.role === 'professor';

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
          <TouchableOpacity
            disabled={!isEditable}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: confirmados.includes(item.$id) ? 'lightgray' : 'white',
            }}
            onPress={() => isEditable && handleSelectAluno(item.$id)}
          >
            <Text>{item.username}</Text>
            <Text style={{ fontSize: 18 }}>{confirmados.includes(item.$id) ? '✓' : '○'}</Text>
          </TouchableOpacity>
        )}
      />

      {isEditable && (
        <CustomButton title="Salvar Alterações" handlePress={handleSave} />
      )}
    </SafeAreaView>
  );
};
export default VerRelacionados;
