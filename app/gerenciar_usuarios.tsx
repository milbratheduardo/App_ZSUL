import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllUsers, getAllProfissionais, getAllAlunos, getAllResponsaveis, updateUserStatus, deleteUser } from '@/lib/appwrite';

const GerenciarUsuarios = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [users, setUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({
    profissionais: 0,
    atletas: 0,
    responsaveis: 0,
    arquivados: 0,
  });

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const allUsers = await getAllUsers();

        const activeUsers = allUsers.filter((user) => user.status !== 'Arquivado');
        const archivedUsers = allUsers.filter((user) => user.status === 'Arquivado');

        const profissionaisCount = activeUsers.filter((user) => user.role === 'profissional').length;
        const atletasCount = activeUsers.filter((user) => user.role === 'atleta').length;
        const responsaveisCount = activeUsers.filter((user) => user.role === 'responsavel').length;

        setUserCounts({
          profissionais: profissionaisCount,
          atletas: atletasCount,
          responsaveis: responsaveisCount,
          arquivados: archivedUsers.length,
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
      const allUsers = await getAllUsers(); // Busca todos os usuários
      let fetchedUsers = [];

      if (type === 'profissionais') {
        const profissionais = await getAllProfissionais();
        fetchedUsers = allUsers
          .filter((user) => user.role === 'profissional' && user.status !== 'Arquivado')
          .map((user) => {
            const profissional = profissionais.find((p) => p.userId === user.userId);
            return {
              userId: user.userId,
              nome: profissional?.nome || 'Nome não informado',
              cpf: profissional?.cpf || 'CPF não informado',
              profissao: profissional?.profissao || 'Profissão não informada',
              role: 'profissional',
            };
          });
      } else if (type === 'atletas') {
        const atletas = await getAllAlunos();
        fetchedUsers = allUsers
          .filter((user) => user.role === 'atleta' && user.status !== 'Arquivado')
          .map((user) => {
            const atleta = atletas.find((a) => a.userId === user.userId);
            return {
              userId: user.userId,
              nome: atleta?.nome || 'Nome não informado',
              cpf: atleta?.cpf || 'CPF não informado',
              posicao: atleta?.posicao || 'Posição não informada',
              role: 'atleta',
            };
          });
      } else if (type === 'responsaveis') {
        const responsaveis = await getAllResponsaveis();
        fetchedUsers = allUsers
          .filter((user) => user.role === 'responsavel' && user.status !== 'Arquivado')
          .map((user) => {
            const responsavel = responsaveis.find((r) => r.userId === user.userId);
            return {
              userId: user.userId,
              nome: responsavel?.nome || 'Nome não informado',
              cpf: responsavel?.cpf || 'CPF não informado',
              whatsapp: responsavel?.whatsapp || 'WhatsApp não informado',
              role: 'responsavel',
            };
          });
      } else if (type === 'arquivados') {
        const profissionais = await getAllProfissionais();
        const atletas = await getAllAlunos();
        const responsaveis = await getAllResponsaveis();

        fetchedUsers = allUsers
          .filter((user) => user.status === 'Arquivado')
          .map((user) => {
            if (user.role === 'profissional') {
              const profissional = profissionais.find((p) => p.userId === user.userId);
              return {
                userId: user.userId,
                nome: profissional?.nome || 'Nome não informado',
                cpf: profissional?.cpf || 'CPF não informado',
                role: 'profissional',
                profissao: profissional?.profissao || 'Profissão não informada',
              };
            } else if (user.role === 'atleta') {
              const atleta = atletas.find((a) => a.userId === user.userId);
              return {
                userId: user.userId,
                nome: atleta?.nome || 'Nome não informado',
                cpf: atleta?.cpf || 'CPF não informado',
                role: 'atleta',
                posicao: atleta?.posicao || 'Posição não informada',
              };
            } else if (user.role === 'responsavel') {
              const responsavel = responsaveis.find((r) => r.userId === user.userId);
              return {
                userId: user.userId,
                nome: responsavel?.nome || 'Nome não informado',
                cpf: responsavel?.cpf || 'CPF não informado',
                role: 'responsavel',
                whatsapp: responsavel?.whatsapp || 'WhatsApp não informado',
              };
            }
            return { userId: user.userId, nome: 'Desconhecido', role: user.role };
          });
      }

      setUsers(fetchedUsers);
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar os ${type}.`);
      console.error(`Erro ao buscar ${type}:`, error.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      Alert.alert('Sucesso', 'Usuário deletado com sucesso.');

      // Remove o usuário da lista
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar o usuário.');
      console.error('Erro ao deletar o usuário:', error.message);
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await updateUserStatus(userId, { status: '' }); // Atualiza o status para vazio ou nulo
      Alert.alert('Sucesso', 'Usuário restaurado com sucesso.');

      // Atualiza a lista de usuários arquivados
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar o usuário.');
      console.error('Erro ao restaurar o usuário:', error.message);
    }
  };

  const handleArchive = async (userId) => {
    try {
      await updateUserStatus(userId, { status: 'Arquivado' }); // Atualiza o status para "Arquivado"
      Alert.alert('Sucesso', 'Usuário arquivado com sucesso.');
      handleSelectUserType(selectedUserType); // Atualiza a lista
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível arquivar o usuário.');
      console.error('Erro ao arquivar o usuário:', error.message);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.nome}</Text>
      {item.role === 'profissional' && <Text style={styles.userInfo}>Profissão: {item.profissao}</Text>}
      {item.role === 'atleta' && <Text style={styles.userInfo}>Posição: {item.posicao}</Text>}
      {item.role === 'responsavel' && <Text style={styles.userInfo}>WhatsApp: {item.whatsapp}</Text>}
      <Text style={styles.userCpf}>CPF: {item.cpf}</Text>

      <View style={styles.iconContainer}>
        {selectedUserType === 'arquivados' ? (
          <TouchableOpacity onPress={() => handleRestoreUser(item.userId)}>
            <Icon name="check" size={20} color="#126046" style={styles.icon} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={() => handleArchive(item.userId)}>
              <Icon name="archive" size={20} color="#126046" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.userId)}>
              <Icon name="trash" size={20} color="#E53935" style={styles.icon} />
            </TouchableOpacity>
          </>
        )}
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
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'arquivados' && styles.selectedCard]}
          onPress={() => handleSelectUserType('arquivados')}
        >
          <Icon name="folder-open" size={24} color="#126046" />
          <Text style={styles.userTypeText}>Arquivados</Text>
          <Text style={styles.userCount}>{userCounts.arquivados}</Text>
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
