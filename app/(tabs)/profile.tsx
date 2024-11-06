import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';

const Profile = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome.split(' ')[0];

  // Opções de navegação com ícones FontAwesome
  const navigationOptions = [
    { title: 'Metodologia de Trabalho', icon: 'cogs', route: '/metodologia' },
    { title: 'Informações Pessoais', icon: 'user', route: '/informacoes_pessoais' },
    { title: 'Dashboard', icon: 'line-chart', route: '/dashboard' },
  ];

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
          <Icon name="user-circle" size={60} color="#126046" style={styles.profileImage} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{firstName}</Text>
            <Text style={styles.userInfo}>{user?.nome} - E.F. SC São Paulo RS</Text>
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
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#555',
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
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  arrowIcon: {
    tintColor: '#126046',
  },
});
