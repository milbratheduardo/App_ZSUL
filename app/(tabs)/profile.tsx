import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import { signOut } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Profile = () => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const firstName = user?.nome.split(' ')[0];
  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';

  let navigationOptions = [];
  if (user.role === 'responsavel') {
    navigationOptions = [
      { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
      { title: 'Comunidade', icon: 'globe', route: '/comunidade' },
      { title: 'Seu Atleta', icon: 'child', route: '/seu_atleta' },
      { title: 'Pagamentos', icon: 'credit-card', route: '/pagamento' },
      { title: 'Meus Pagamentos', icon: 'file-text', route: '/faturas' },
    ];
  } else if (user.role === 'profissional') {
    navigationOptions = [
      { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
      { title: 'Metodologia de Trabalho', icon: 'book', route: '/metodologia' },
      { title: 'Comunidade', icon: 'globe', route: '/comunidade' },
      { title: 'Turmas', icon: 'group', route: '/all_turmas' },
      { title: 'Criar Treinos Personalizados', icon: 'heartbeat', route: '/personalize_training' },
      { title: 'Dashboard', icon: 'line-chart', route: '/dashboard' },
    ];
    if (user.admin === 'admin') {
      navigationOptions.push({ title: 'Administração', icon: 'building', route: '/admin_profile' });
    }
  } else if (user.role === 'atleta') {
    navigationOptions = [
      { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
      { title: 'Treinos Personalizados', icon: 'heartbeat', route: '/dash_treinos2' },
      { title: 'Comunidade', icon: 'globe', route: '/comunidade' },
    ];
  }

  const logout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      setErrorMessage(`Erro ao fazer logout.`);
      setShowErrorModal(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula uma operação de atualização (exemplo: buscar novamente os dados do usuário)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={() => router.push(item.route)}>
      <View style={styles.optionContent}>
        <Icon name={item.icon} size={24} color="#333" style={styles.optionIcon} />
        <Text style={styles.optionText}>{item.title}</Text>
      </View>
      <Icon name="angle-right" size={16} color="#888" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
              <Text style={styles.userInfo}>E.F. SC São Paulo RS</Text>
            </View>
          </View>

        </View>
      </View>

      <FlatList
        data={navigationOptions}
        renderItem={renderOption}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.optionsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity style={styles.reportButton} onPress={logout}>
        <Text style={styles.reportButtonText}>Sair</Text>
      </TouchableOpacity>
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

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#126046',
  },
  reportButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 5,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    marginLeft: -80,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  teamLogo: {
    marginLeft: 16,
  },
  optionsList: {
    padding: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
    color: '#126046',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  arrowIcon: {
    color: '#126046',
  },
});
