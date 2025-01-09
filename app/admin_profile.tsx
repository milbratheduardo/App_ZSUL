import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { router } from 'expo-router';

const AdminOptions = () => {
  const { user } = useGlobalContext();

  // Verifica se o usuário é administrador
  if (user.admin !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.errorText}>
            Acesso negado. Somente administradores podem acessar esta área.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Opções de navegação para administradores
  const adminOptions = [
    { title: 'Gerenciar Usuários', icon: 'users-cog', route: '/gerenciar_usuarios' },
    { title: 'Vincular Profissional', icon: 'user-plus', route: '/vincular_prof' },
    { title: 'Pagamentos Atuais', icon: 'wallet', route: '/pagamentos_atuais' },
    { title: 'Histórico de Pagamentos', icon: 'history', route: '/historico_pagamentos' },
    { title: 'Gerenciamento de Dados', icon: 'chart-line', route: '/gerenciamento_dados' },
  ];

  const renderOption = ({ item }: { item: { title: string; icon: string; route: string } }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={() => router.push(item.route)}>
      <View style={styles.optionContent}>
        <FontAwesome5 name={item.icon} size={24} style={styles.optionIcon} />
        <Text style={styles.optionText}>{item.title}</Text>
      </View>
      <FontAwesome5 name="angle-right" size={16} style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Administrador {user?.nome.split(' ')[0]}</Text>
        <Text style={styles.userInfo}>Painel Administrativo</Text>
      </View>

      <FlatList
        data={adminOptions}
        renderItem={renderOption}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.optionsList}
      />
    </SafeAreaView>
  );
};

export default AdminOptions;

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
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
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
