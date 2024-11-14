import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { getAllTurmas, getAlunosByTurmaId } from '@/lib/appwrite'; 
import { images } from '@/constants'; 
import { router } from 'expo-router';

const History = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allTurmas = await getAllTurmas();
        
        // Filtrar turmas em que o user.userId está em turma.profissionalId ou se o user é responsável com cpf associado
        const userTurmas = allTurmas.filter(turma => 
          turma.profissionalId.includes(user.userId) || user.role === 'responsavel'
        );

        setTurmas(userTurmas);
        
        // Buscar alunos de cada turma e adicionar à lista de alunos com o título da turma
        const alunosData = [];
        for (const turma of userTurmas) {
          const turmaAlunos = await getAlunosByTurmaId(turma.$id);

          // Filtrar os alunos para mostrar apenas aqueles com o nomeResponsavel igual ao user.cpf para responsáveis
          const filteredAlunos = turmaAlunos.filter(aluno => 
            user.role !== 'responsavel' || aluno.nomeResponsavel === user.cpf
          );

          filteredAlunos.forEach(aluno => {
            alunosData.push({ ...aluno, turmaTitle: turma.title });
          });
        }
        
        setAlunos(alunosData);
        setFilteredAlunos(alunosData); // Inicializar lista de alunos filtrados
      } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
      }
    };

    fetchData();
  }, [user.userId]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const handleAlunoPress = (alunoId) => {
    router.push({
      pathname: '/detalhesAluno',
      params: { alunoId }
    });
  };

  const renderAluno = ({ item }) => {
    const positionDetails = {
      goleiro: { abbreviation: 'GL', color: '#800080' },
      'zagueiro central': { abbreviation: 'ZC', color: '#1E90FF' },
      'lateral direito': { abbreviation: 'LD', color: '#1E90FF' },
      'lateral esquerdo': { abbreviation: 'LE', color: '#1E90FF' },
      volante: { abbreviation: 'VOL', color: '#32CD32' },
      'meia central': { abbreviation: 'MC', color: '#32CD32' },
      'meia ofensivo': { abbreviation: 'MO', color: '#32CD32' },
      'meia defensivo': { abbreviation: 'MD', color: '#32CD32' },
      'ponta direita': { abbreviation: 'PD', color: '#FF6347' },
      'ponta esquerda': { abbreviation: 'PE', color: '#FF6347' },
      centroavante: { abbreviation: 'CA', color: '#FF6347' },
    };

    const position = positionDetails[item.posicao.toLowerCase()] || {};
    const alunoInfo = `${item.nome} - ${item.turmaTitle}`;

    return (
      <TouchableOpacity style={styles.alunoContainer} onPress={() => handleAlunoPress(item.userId)}>
        <View style={styles.alunoInfo}>
          <Image source={{ uri: item.avatar }} style={styles.alunoAvatar} />
          <Text style={styles.alunoNome}>{alunoInfo}</Text>
        </View>
        <View style={[styles.posicaoContainer, { backgroundColor: position.color || '#808080' }]}>
          <Text style={styles.posicaoText}>{position.abbreviation || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={styles.welcomeText}>Bem Vindo</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <Image source={images.escola_sp_transparente} style={styles.logo} />
        </View>

        <TextInput
          placeholder="Pesquisar por nome do atleta"
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />

        {filteredAlunos.length === 0 ? (
          <Text style={styles.noAlunosText}>Nenhum aluno encontrado</Text>
        ) : (
          <FlatList
            data={filteredAlunos}
            keyExtractor={(item) => item.$id}
            renderItem={renderAluno}
            style={styles.alunosList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  logo: { width: 115, height: 90 },
  welcomeText: { fontSize: 14, color: '#126046' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#126046' },
  alunosList: { marginTop: 10 },
  alunoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 10 },
  alunoInfo: { flexDirection: 'row', alignItems: 'center' },
  alunoAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  alunoNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  posicaoContainer: { width: 50, borderRadius: 5, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  posicaoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, marginVertical: 10, borderColor: '#ccc', borderWidth: 1 },
  noAlunosText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 20 },
});
