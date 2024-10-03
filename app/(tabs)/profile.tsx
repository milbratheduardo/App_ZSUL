import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, RefreshControl, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PDFView from 'react-native-pdf';  // Verifique se essa importação está correta
import { signOut, getAlunosByUserId, atualizarDiaCobranca, gerarPdfContrato } from '@/lib/appwrite';  // Certifique-se que todas as funções estão exportadas corretamente
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '@/constants';
import EmptyState from '@/components/EmptyState';  // Verifique se é export default
import InfoBox from '@/components/InfoBox';  // Verifique se é export default
import CustomButton from '@/components/CustomButton';  // Verifique se é export default
import { router } from 'expo-router';  // Verifique se a versão do `expo-router` está correta para suportar o uso de `router`

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [tipoContrato, setTipoContrato] = useState('');
  const [diaCobranca, setDiaCobranca] = useState('');

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
    setLoadingLogout(true);
    try {
      await signOut();
      router.replace('/signin');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível efetuar o logout.');
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleAssinarContrato = (alunoId) => {
    setSelectedAlunoId(alunoId);
    setTipoContrato('');
    setDiaCobranca('');
    setModalVisible(true);
  };

  const iniciarAssinatura = async () => {
    try {
      const dia = parseInt(diaCobranca, 10);
      if (isNaN(dia) || dia < 1 || dia > 31) {
        Alert.alert('Erro', 'Por favor, insira um dia válido (1-31).');
        return;
      }
  
      await atualizarDiaCobranca(selectedAlunoId, diaCobranca);
  
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o processo de assinatura.');
      console.error('Erro ao iniciar assinatura:', error);
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

      {item.assinado === null || item.assinado === '' ? (
        <CustomButton
          title="Assinar Contrato"
          handlePress={() => handleAssinarContrato(item.$id)}
          containerStyles="p-3 mt-5"
        />
      ) : item.assinado === 'sim' ? (
        <Text style={{ fontSize: 16, color: 'green', marginTop: 10 }}>{item.tipo_contrato}</Text>
      ) : null}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            {tipoContrato === '' ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                  Escolha o Tipo de Contrato
                </Text>
                <CustomButton title="Contrato Mensal" handlePress={() => setTipoContrato('mensal')} containerStyles="mb-4" />
                <CustomButton title="Contrato Semestral" handlePress={() => setTipoContrato('semestral')} containerStyles="mb-4" />
                <CustomButton title="Contrato Anual" handlePress={() => setTipoContrato('anual')} containerStyles="mb-4" />
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                  Tipo de Contrato Selecionado: {tipoContrato.charAt(0).toUpperCase() + tipoContrato.slice(1)}
                </Text>
                <TextInput
                  placeholder="Digite o dia da cobrança (1-31)"
                  keyboardType="numeric"
                  value={diaCobranca}
                  onChangeText={setDiaCobranca}
                  style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 20 }}
                />
                <CustomButton title="Confirmar" handlePress={iniciarAssinatura} containerStyles="mb-4" />
              </>
            )}
            <CustomButton title="Cancelar" handlePress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
