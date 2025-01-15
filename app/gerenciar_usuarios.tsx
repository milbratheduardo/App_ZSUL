import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllUsers, getAllProfissionais, getAllAlunos, getAllResponsaveis, updateUserStatus, deleteUser } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GerenciarUsuarios = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [users, setUsers] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
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
        setErrorMessage(`Não foi possível carregar os dados dos usuários.`);
        setShowErrorModal(true);
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
      setErrorMessage(`Não foi possível carregar os dados.`);
      setShowErrorModal(true);
    }
  };

  const handleDelete = async (userId) => {
    Alert.alert(
      "Confirmação",
      "Você realmente quer excluir este usuário?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await deleteUser(userId);
              setSuccessMessage('Usuário deletado com sucesso!');
              setShowSuccessModal(true);
  
              // Remove o usuário da lista
              setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
            } catch (error) {
              setErrorMessage(`Não foi possível deletar usuário.`);
              setShowErrorModal(true);
            }
          },
          style: "destructive", // Define o estilo vermelho para o botão "Excluir"
        },
      ],
      { cancelable: true } // Permite fechar o alerta ao tocar fora
    );
  };
  

  const handleRestoreUser = async (userId) => {
    try {
      await updateUserStatus(userId, { status: '' }); // Atualiza o status para vazio ou nulo
      setSuccessMessage('Usuário restaurado com sucesso!');
      setShowSuccessModal(true);

      // Atualiza a lista de usuários arquivados
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
    } catch (error) {
      setErrorMessage(`Não foi possível restaurar usuário.`);
      setShowErrorModal(true);
    }
  };

  const handleArchive = async (userId) => {
    try {
      await updateUserStatus(userId, { status: 'Arquivado' }); // Atualiza o status para "Arquivado"
      setSuccessMessage('Usuário arquivado com sucesso!');
      setShowSuccessModal(true);
      handleSelectUserType(selectedUserType); // Atualiza a lista
    } catch (error) {
      setErrorMessage(`Não foi possível arquivar usuário.`);
      setShowErrorModal(true);
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
          <Text style={styles.userCount}>{userCounts.profissionais}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'atletas' && styles.selectedCard]}
          onPress={() => handleSelectUserType('atletas')}
        >
          <Icon name="running" size={24} color="#126046" />
          <Text style={styles.userCount}>{userCounts.atletas}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'responsaveis' && styles.selectedCard]}
          onPress={() => handleSelectUserType('responsaveis')}
        >
          <Icon name="user-friends" size={24} color="#126046" />
          <Text style={styles.userCount}>{userCounts.responsaveis}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeCard, selectedUserType === 'arquivados' && styles.selectedCard]}
          onPress={() => handleSelectUserType('arquivados')}
        >
          <Icon name="folder-open" size={24} color="#126046" />
          <Text style={styles.userCount}>{userCounts.arquivados}</Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.userList}
        ListHeaderComponent={() =>
          selectedUserType && (
            <Text style={styles.listHeader}>
              {selectedUserType === 'profissionais' && 'Lista de Profissionais'}
              {selectedUserType === 'atletas' && 'Lista de Atletas'}
              {selectedUserType === 'responsaveis' && 'Lista de Responsáveis'}
              {selectedUserType === 'arquivados' && 'Usuários Arquivados'}
            </Text>
          )
        }
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
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
              <Modal
              visible={showSuccessModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSuccessModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.successModal}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="white" />
                  <Text style={styles.modalTitle}>Sucesso</Text>
                  <Text style={styles.modalMessage}>{successMessage}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowSuccessModal(false);
                      
                    }}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
    textAlign: 'center',
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
    fontSize: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
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
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
