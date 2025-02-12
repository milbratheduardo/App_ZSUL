import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAlunos, getAllUsers, getEventsConfirmados, getAllResponsaveis, getAllProfissionais } from '@/lib/appwrite'; // Funções necessárias
import { useLocalSearchParams } from 'expo-router'; // Para pegar os parâmetros passados via navegação
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VerConfirmados = () => {
  const [alunos, setAlunos] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredConfirmados, setFilteredConfirmados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  // Pegando os parâmetros passados via navegação
  const { confirmados: confirmadosParam, eventTitle, eventId } = useLocalSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const confirmadosIds = await getEventsConfirmados(eventId);
  
      if (confirmadosIds.length > 0) {
        const allUsers = await getAllUsers();
        const responsaveis = await getAllResponsaveis();
        const alunos = await getAllAlunos();
        const profissionais = await getAllProfissionais();
  
        const confirmadosData = confirmadosIds.map((userId) => {
          const user = allUsers.find((u) => u.userId === userId);
  
          if (!user) return null;
  
          if (user.role === 'responsavel') {
            const responsavel = responsaveis.find((r) => r.userId === userId);
            return responsavel ? { userId, nome: responsavel.nome, role: 'responsavel' } : null;
          } else if (user.role === 'atleta') {
            const aluno = alunos.find((a) => a.userId === userId);
            return aluno ? { userId, nome: aluno.nome, role: 'atleta' } : null;
          } else if (user.role === 'profissional') {
            const profissional = profissionais.find((p) => p.userId === userId);
            return profissional ? { userId, nome: profissional.nome, role: 'profissional' } : null;
          }
  
          return null;
        });
  
        setFilteredConfirmados(confirmadosData.filter((item) => item !== null));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados.');
      setShowErrorModal(true);
    }
  };
  
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === '') {
      fetchData(); // Recarregar a lista completa se a pesquisa estiver vazia
    } else {
      const filtered = filteredConfirmados.filter((item) =>
        item.nome.toLowerCase().includes(text.toLowerCase())
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
            keyExtractor={(item, index) => item.userId || index.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  backgroundColor: 'white',
                }}
              >
                <Text>{item.nome}</Text>
                <Text style={{ fontSize: 18 }}>{'✓'}</Text>
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

export default VerConfirmados;
