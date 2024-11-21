import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { signOut } from '@/lib/appwrite';

const Profile = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];

  // URL da foto de perfil
  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';

  // Opções de navegação com ícones FontAwesome
  let navigationOptions = [];

  if (user.role === 'responsavel') {
    navigationOptions = [
      { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
      { title: 'Comunidade', icon: 'globe', route: '/comunidade' },
      { title: 'Seu Atleta', icon: 'child', route: '/seu_atleta' },
      { title: 'Pagamentos', icon: 'credit-card', route: '/pagamento' },
      { title: 'Faturas', icon: 'file-text', route: '/faturas' },
    ];
  } else if (user.role === 'profissional') {
    navigationOptions = [
      { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
      { title: 'Metodologia de Trabalho', icon: 'cogs', route: '/metodologia' },
      { title: 'Comunidade', icon: 'globe', route: '/comunidade' },
      { title: 'Turmas', icon: 'group', route: '/all_turmas' },
      { title: 'Treinos Personalizados', icon: 'heartbeat', route: '/personalize_training' },
      { title: 'Dashboard', icon: 'line-chart', route: '/dashboard' },
    ];
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
      console.error("Erro ao fazer logout:", error);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{firstName}</Text>
              <Text style={styles.userInfo}>{user?.nome} - E.F. SC São Paulo RS</Text>
            </View>
          </View>
          <Icon name="shield" size={50} color="#126046" style={styles.teamLogo} />
        </View>
      </View>

      {/* Navigation Options */}
      <FlatList
        data={navigationOptions}
        renderItem={renderOption}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.optionsList}
      />

      {/* Botão para Suporte */}
      <TouchableOpacity style={styles.reportButton} onPress={logout}>
        <Text style={styles.reportButtonText}>Sair</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 0,
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
    justifyContent: 'center',
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
