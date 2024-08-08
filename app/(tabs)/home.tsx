import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import {React, useState, useEffect} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import { getAllTurmas, getTodaysTurmas } from '@/lib/appwrite'
import EmptyState from '@/components/EmptyState'
import TurmasCard from '@/components/TurmaCard'
import Todays from '@/components/Todays'

const Home = () => {
  const [data, setData] = useState([]);
  const [todaysData, setTodaysData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await getAllTurmas();

      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const refetch = () => fetchData();

  const todaysTurmas = async () => {
    setIsLoading(true);

    try {
      const todays = await getTodaysTurmas();
      setTodaysData(todays);
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    todaysTurmas();
  }, []);

  console.log(todaysData)

  const [refreshing, setRefreshing ] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }
  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList 
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
            <TurmasCard turma={item}/>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-primary">
                  Bem Vindo
                </Text>
                <Text className="text-2xl font-psemibold text-golden">
                  Eduardo
                </Text>
              </View>
              <View className="mt-1.5">
                <Image 
                  source={images.logo_zsul}
                  className="w-[115px] h-[35px]"                                 
                />
              </View>
            </View>
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-primary text-lg font-pregular mb-3">
                Turmas Disponíveis
              </Text>

              <Todays posts={todaysData}/>

            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhuma Turma Encontrada"
            subtitle="Não foi criada nenhuma turma"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} 
          onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

export default Home