import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllUsers, getAllProfissionais, getAllAlunos, getAllResponsaveis } from '@/lib/appwrite';

const GerenciarUsuarios = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [users, setUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({ profissionais: 0, atletas: 0, responsaveis: 0 });

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const allUsers = await getAllUsers();
        const profissionaisCount = allUsers.filter(user => user.role === 'profissional').length;
        const atletasCount = allUsers.filter(user => user.role === 'atleta').length;
        const responsaveisCount = allUsers.filter(user => user.role === 'responsavel').length;

        setUserCounts({
          profissionais: profissionaisCount,
          atletas: atletasCount,
          responsaveis: responsaveisCount,
        });
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados dos usuários.');
        console.error('Erro ao buscar usuários:', error.message);
      }
    };

    fetchUserCounts();
  }, []);

  const handleSelectUserType = async (type) => {
    setSelectedUserType(type);
    try {
      let fetchedUsers = [];
      if (type === 'profissionais') {
        fetchedUsers = await getAllProfissionais();
        setUsers(
          fetchedUsers.map((profissional) => ({
            userId: profissional.userId || 'ID Desconhecido',
            nome: profissional.nome || 'Nome não informado',
            cpf: profissional.cpf || 'CPF não informado',
            profissao: profissional.profissao || 'Profissão não informada',
          }))
        );
      } else if (type === 'atletas') {
        fetchedUsers = await getAllAlunos();
        setUsers(
          fetchedUsers.map((aluno) => ({
            userId: aluno.userId || 'ID Desconhecido',
            nome: aluno.nome || 'Nome não informado',
            posicao: aluno.posicao || 'Posição não informada',
            cpf: aluno.cpf || 'CPF não informado',
          }))
        );
      } else if (type === 'responsaveis') {
        fetchedUsers = await getAllResponsaveis();
        setUsers(
          fetchedUsers.map((responsavel) => ({
            userId: responsavel.userId || 'ID Desconhecido',
            nome: responsavel.nome || 'Nome não informado',
            cpf: responsavel.cpf || 'CPF não informado',
            whatsapp: responsavel.whatsapp || 'WhatsApp não informado',
          }))
        );
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar os ${type}.`);
      console.error(`Erro ao buscar ${type}:`, error.message);
    }
  };

  const handleArchive = (userId) => {
    Alert.alert('Arquivar', `Deseja arquivar o usuário com ID ${userId}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => console.log(`Usuário ${userId} arquivado`) },
    ]);
  };

  const handleDelete = (userId) => {
    Alert.alert('Deletar', `Deseja deletar o usuário com ID ${userId}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => console.log(`Usuário ${userId} deletado`) },
    ]);
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.nome}</Text>
      {selectedUserType === 'profissionais' && <Text style={styles.userInfo}>Profissão: {item.profissao}</Text>}
      {selectedUserType === 'atletas' && <Text style={styles.userInfo}>Posição: {item.posicao}</Text>}
      {selectedUserType === 'responsaveis' && <Text style={styles.userInfo}>WhatsApp: {item.whatsapp}</Text>}
      <Text style={styles.userCpf}>CPF: {item.cpf}</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleArchive(item.userId)}>
          <Icon name="archive" size={20} color="#126046" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.userId)}>
          <Icon name="trash" size={20} color="#E53935" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Gerenciar Usuários</Text>
      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'profissionais' && styles.selectedCard]}
          onPress={() => handleSelectUserType('profissionais')}
        >
          <Icon name="briefcase" size={24} color="#126046" />
          <Text style={styles.userTypeText}>Profissionais</Text>
          <Text style={styles.userCount}>{userCounts.profissionais}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'atletas' && styles.selectedCard]}
          onPress={() => handleSelectUserType('atletas')}
        >
          <Icon name="running" size={24} color="#126046" />
          <Text style={styles.userTypeText}>Atletas</Text>
          <Text style={styles.userCount}>{userCounts.atletas}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'responsaveis' && styles.selectedCard]}
          onPress={() => handleSelectUserType('responsaveis')}
        >
          <Icon name="user-friends" size={24} color="#126046" />
          <Text style={styles.userTypeText}>Responsáveis</Text>
          <Text style={styles.userCount}>{userCounts.responsaveis}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.userList}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Selecione um tipo de usuário para exibir a lista.</Text>
        )}
      />
    </SafeAreaView>
  );
};

export default GerenciarUsuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    marginVertical: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userTypeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#126046',
    borderWidth: 2,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  userCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#126046',
    marginTop: 4,
  },
  userList: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  userCpf: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  icon: {
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
