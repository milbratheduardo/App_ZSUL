import { Image, StyleSheet, Text, TouchableOpacity, View, FlatList, RefreshControl } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/components/EmptyState';
import { signOut } from '@/lib/appwrite';

import { useGlobalContext } from '@/context/GlobalProvider'
import { icons } from '@/constants';
import InfoBox from '@/components/InfoBox';
import { router } from 'expo-router';

const Profile = () => {
  const {user, setUser, setIsLoggedIn } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    //await fetchData();
    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace('/signin')
  }
  return (
    <SafeAreaView className="bg-gray h-full">
      <FlatList
        contentContainerStyle={{ paddingBottom: 63 }}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity 
              className="w-full items-end mb-10"
              onPress={logout}
              >
              <Image source={icons.logout} resizeMode='contain' className="w-6 h-6"/>
            </TouchableOpacity>
            <View className= "w-16 h-16 border border-golden rounded-lg
             justify-center items-center">
              <Image source={{ uri: user?.avatar}} 
                className="w-[90%] h-[90%] rounded-lg" 
                resizeMode='cover'
              />
            </View>
            <InfoBox 
              title = {user?.username}
              email = {user?.email}
              containerStyles = 'mt-5'
              titleStyles = "text-lg"
            />

          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Nenhum Atleta Encontrado"
            subtitle="Não foi adicionado nenhum atleta"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile

const styles = StyleSheet.create({})