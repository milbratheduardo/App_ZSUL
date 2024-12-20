import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router'; // Hook para pegar parâmetros
import { getAlunosByTurmaId } from '@/lib/appwrite'; // Função para buscar alunos pela turma_id
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TurmaAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const { turmaId, turmaTitle } = useLocalSearchParams();

  useEffect(() => {
    fetchAlunosByTurma();
  }, [turmaId]);


  const fetchAlunosByTurma = async () => {
    try {
      const alunosData = await getAlunosByTurmaId(turmaId);
      console.log('Alunos retornados:', alunosData);

      if (alunosData.length === 0) {
        console.warn('Nenhum aluno foi encontrado para essa turma.');
      }

      setAlunos(alunosData);
      setFilteredAlunos(alunosData.slice(0, 10)); 
    } catch (error) {
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
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
        Alunos da Turma {turmaTitle}
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

export default TurmaAlunos;
