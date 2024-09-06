import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import { getAllTurmas} from '@/lib/appwrite';
import EmptyState from '@/components/EmptyState';
import TurmasCard from '@/components/TurmaCard';
import { useGlobalContext } from '@/context/GlobalProvider'

const Alunos = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {user, setUser, setIsLoggedIn } = useGlobalContext();

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await getAllTurmas();
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstName = user?.username.split(' ')[0];

  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <TurmasCard turma={item} />}
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-2">
              <View>
                <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
                <Text className="text-2xl font-psemibold text-golden">{firstName}</Text>
              </View>
              <View className="mt-1.5">
                <Image source={images.logo_zsul} className="w-[115px] h-[35px]" />
              </View>
            </View>
            <View className="w-full flex-1 pt-5 pb-2">
              <Text className="text-primary text-lg font-pregular mb-1">
                Turmas Disponíveis
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Turma Encontrada"
            subtitle="Não foi criada nenhuma turma"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Alunos;
