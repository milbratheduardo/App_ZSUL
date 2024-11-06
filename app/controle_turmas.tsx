import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import TurmasCard2 from '@/components/TurmaCard2';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import { getTurmaById, getAlunosByTurmaId } from '@/lib/appwrite';
import { router } from 'expo-router';

const ControleTurmas = () => {
  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState([]);

  const { turmaId } = useLocalSearchParams();

  useEffect(() => {
    const fetchTurma = async () => {
      try {
        const turmaData = await getTurmaById(turmaId);
        setTurma(turmaData);
      } catch (error) {
        console.error('Erro ao buscar turma:', error.message);
      }
    };

    const fetchAlunos = async () => {
      try {
        const alunosData = await getAlunosByTurmaId(turmaId);
        setAlunos(alunosData);
        setFilteredAlunos(alunosData); // Inicializa a lista filtrada com todos os alunos
      } catch (error) {
        console.error('Erro ao buscar alunos:', error.message);
      }
    };

    fetchTurma();
    fetchAlunos();
  }, [turmaId]);

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    setSearchText(''); // Limpa o campo de pesquisa
    setFilteredAlunos(alunos); // Restaura a lista completa quando oculta a pesquisa
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = alunos.filter((aluno) =>
      aluno.nome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleAtleta = () => {
    router.push({
      pathname: '/cadastrar_alunos',
      params: { turmaId, turmaTitle: turma.title },
    });
  };

  const toggleNotifica = () => {
    router.push({
      pathname: '/notifica',
      params: { turmaId, turmaTitle: turma.title },
    });
  };

  const toggleChamadas = () => {
    router.push({
      pathname: '/ver_chamadas',
      params: { turmaId, turmaTitle: turma.title },
    });
  };

  const toggleRelatorio = () => {
    router.push({
      pathname: '/relatorios',
      params: { turmaId, turmaTitle: turma.title },
    });
  };

  // Definições para abreviações e cores das posições dos atletas
  const positionDetails = {
    goleiro: { abbreviation: 'GL', color: '#800080' },
    'zagueiro central': { abbreviation: 'ZC', color: '#1E90FF' },
    'lateral direito': { abbreviation: 'LD', color: '#1E90FF' },
    'lateral esquerdo': { abbreviation: 'LE', color: '#1E90FF' },
    'volante': { abbreviation: 'VOL', color: '#32CD32' },
    'meia central': { abbreviation: 'MC', color: '#32CD32' },
    'meia ofensivo': { abbreviation: 'MO', color: '#32CD32' },
    'meia defensivo': { abbreviation: 'MD', color: '#32CD32' },
    'ponta direita': { abbreviation: 'PD', color: '#FF6347' },
    'ponta esquerda': { abbreviation: 'PE', color: '#FF6347' },
    'centroavante': { abbreviation: 'CA', color: '#FF6347' },
  };

  const renderAluno = ({ item }) => {
    const position = positionDetails[item.posicao.toLowerCase()] || {};

    const handleAlunoClick = () => {
      router.push({
        pathname: '/detalhesAluno',
        params: { alunoId: item.userId },
      });
    };

    return (
      <TouchableOpacity style={styles.alunoContainer} onPress={handleAlunoClick}>
        <View style={styles.alunoInfo}>
          <Image source={{ uri: item.avatar }} style={styles.alunoAvatar} />
          <Text style={styles.alunoNome}>{item.nome}</Text>
        </View>
        <View style={[styles.posicaoContainer, { backgroundColor: position.color || '#808080' }]}>
          <Text style={styles.posicaoText}>{position.abbreviation || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {menuOpen && <View style={styles.overlay} />}

      <View style={styles.contentContainer}>
        {turma ? (
          <TurmasCard2
            turma={{
              turmaId: turma.$id,
              title: turma.title,
              Horario_de_inicio: turma.Horario_de_inicio,
              Horario_de_termino: turma.Horario_de_termino,
              Local: turma.Local,
              Dia1: turma.Dia1,
              Dia2: turma.Dia2,
              Dia3: turma.Dia3,
              MaxAlunos: turma.MaxAlunos,
            }}
          />
        ) : (
          <Text>Carregando dados da turma...</Text>
        )}

       
          <TextInput
            placeholder="Pesquisar por nome do atleta"
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        

        {filteredAlunos.length === 0 ? (
          <Text style={styles.noAlunosText}>Nenhum aluno cadastrado</Text>
        ) : (
          <FlatList
            data={filteredAlunos}
            keyExtractor={(item) => item.$id}
            renderItem={renderAluno}
            style={styles.alunosList}
          />
        )}
      </View>

      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Icon name="bars" size={24} color="#fff" />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menuOptions}>
          <TouchableOpacity style={styles.menuOption} onPress={toggleRelatorio}>
            <Icon name="file-text" size={18} color="#006400" style={styles.menuIcon} />
            <Text style={styles.menuText}>Relatório de Treino</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={toggleChamadas}>
            <Icon name="check-square" size={18} color="#006400" style={styles.menuIcon} />
            <Text style={styles.menuText}>Chamada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={toggleAtleta}>
            <Icon name="user-plus" size={18} color="#006400" style={styles.menuIcon} />
            <Text style={styles.menuText}>Inserir Atleta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={toggleNotifica}>
            <Icon name="bell" size={18} color="#006400" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notificação</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 32,
  },
  contentContainer: {
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  alunosList: {
    marginTop: 20,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  alunoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alunoAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  noAlunosText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#666',
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  posicaoContainer: {
    width: 50,
    borderRadius: 5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posicaoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#006400',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOptions: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#827b7b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#006400',
    fontSize: 16,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});

export default ControleTurmas;
