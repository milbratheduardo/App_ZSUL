import { Image, Text, TouchableOpacity, View, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/components/EmptyState';
import { signOut } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '@/constants';
import InfoBox from '@/components/InfoBox';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { getAlunosByUserId } from '@/lib/appwrite';

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlunos();
    }
  }, [user]);

  const fetchAlunos = async () => {
    try {
      const fetchedAlunos = await getAlunosByUserId(user.userId);
      setAlunos(fetchedAlunos);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlunos();
    setRefreshing(false);
  };

  const logout = async () => {
    setLoadingLogout(true); // Ativar o estado de loading
    try {
      await signOut();
      router.replace('/signin'); // Redirecionar após sucesso no logout
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível efetuar o logout.');
    } finally {
      setLoadingLogout(false); // Desativar o loading
    }
  };

  const renderAluno = ({ item }) => (
    <View style={{
      padding: 16,
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginBottom: 16,
      marginHorizontal: 16,
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{item.username}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.nascimento}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.escola}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.ano}</Text>
    </View>
  );

  // Se estiver em processo de logout, mostrar um indicador de carregamento
  if (loadingLogout) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  // Evitar acessar propriedades de 'user' quando ele for null
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Usuário não autenticado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.$id}
        renderItem={renderAluno}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 24, paddingHorizontal: 16 }}>
            <TouchableOpacity 
              style={{ width: '100%', alignItems: 'flex-end', marginBottom: 16 }}
              onPress={logout}
            >
              <Image source={icons.logout} resizeMode='contain' style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <View style={{
              width: 64,
              height: 64,
              borderWidth: 1,
              borderColor: 'goldenrod',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image source={{ uri: user?.avatar }} 
                style={{ width: '90%', height: '90%', borderRadius: 8 }} 
                resizeMode='cover'
              />
            </View>
            <InfoBox 
              title={user?.username}
              email={user?.email}
              containerStyles='mt-5'
              titleStyles="text-lg"
            />
            {user.role === 'responsavel' && (
            <CustomButton 
              title="Novo Atleta"
              handlePress={() => router.push('/cadastro_atleta')}
              containerStyles="p-3 mt-10"
            />
            )}
            {user.role === 'responsavel' && (
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, color: 'black' }}>
              Sou Responsável por:
            </Text>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          user.role === 'responsavel' && ( 
            <EmptyState
              title="Nenhum Atleta Encontrado"
              subtitle="Não foi adicionado nenhum atleta"
            />
          )
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;

