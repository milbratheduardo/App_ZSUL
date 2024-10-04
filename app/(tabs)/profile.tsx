import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, getAlunosByUserId, getPdfUrl, updateAlunoContrato, getUsersByUserId } from '@/lib/appwrite';  // Certifique-se que todas as funções estão exportadas corretamente
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '@/constants';
import EmptyState from '@/components/EmptyState';  // Verifique se é export default
import InfoBox from '@/components/InfoBox';  // Verifique se é export default
import CustomButton from '@/components/CustomButton';  // Verifique se é export default
import { router } from 'expo-router';  // Verifique se a versão do expo-router está correta para suportar o uso de router
import * as Linking from 'expo-linking'; // Para abrir o PDF no navegador

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignVisible, setModalSignVisible] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);

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
    setModalVisible(true);
  };

  const getFileIdByTipoContrato = (tipoContrato) => {
    switch (tipoContrato) {
      case 'mensal':
        return '66fee6250006b255421f';
      case 'semestral':
        return '66fee60e00368e53ba2e';
      case 'anual':
        return '66fee5fb003461b55364';
      default:
        return null;
    }
  };

  const iniciarAssinatura = async (tipoContrato, alunoId) => {
    try {
      const fileId = getFileIdByTipoContrato(tipoContrato);
      if (!fileId) {
        Alert.alert('Erro', 'Tipo de contrato inválido.');
        return;
      }

      await updateAlunoContrato(alunoId, { tipo_contrato: tipoContrato, indice_fluxo: '1' });

      const pdfUrl = await getPdfUrl(fileId);
      setModalVisible(false);
      if (pdfUrl) {
        Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o contrato.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o contrato.');
      console.error('Erro ao carregar o contrato:', error);
    }
  };

  const cancelarMatricula = async (alunoId) => {
    console.log('ALUNO: ', alunoId)
    try {
      await updateAlunoContrato(alunoId.id, { tipo_contrato: null, indice_fluxo: null });
      setModalSignVisible(false);
      Alert.alert('Matrícula cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar matrícula:', error);
      Alert.alert('Erro', 'Não foi possível cancelar a matrícula.');
    }
  };
  

  const handleSign = async (alunoId) => {    
    try {
      const aluno = alunos.find(a => a.$id === alunoId);      
      const userData = await getUsersByUserId(aluno.createdByUserId);      
      setSelectedAluno({
        id: aluno.$id,
        username: aluno.username,
        rg: aluno.rg,
        createdByUsername: userData.username,
        createdByCpf: userData.cpf,
      });
      setModalSignVisible(true);
    } catch (error) {
      console.error('Erro ao buscar dados do aluno e do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados para assinatura.');
    }
  };

  const assinarContrato = async () => {
    try {
      
      const aluno = alunos.find(a => a.$id === selectedAluno);

      const tipoContrato = aluno.tipo_contrato;

      const pdfUrl = await getPdfUrl(getFileIdByTipoContrato(ti)); // exemplo com contrato mensal
      if (!pdfUrl) {
        Alert.alert('Erro', 'Não foi possível carregar o contrato.');
        return;
      }

      // Aqui você pode implementar a lógica para adicionar a marca d'água no PDF
      // Por exemplo, uma função para modificar o PDF, adicionando as informações necessárias

      setModalSignVisible(false);
      Linking.openURL(pdfUrl); // Abre o PDF depois de adicionar a marca d'água
    } catch (error) {
      console.error('Erro ao assinar o contrato:', error);
      Alert.alert('Erro', 'Não foi possível assinar o contrato.');
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

      {item.indice_fluxo === null || item.indice_fluxo === '' ? (
        <CustomButton
          title="Matricular Aluno"
          handlePress={() => handleAssinarContrato(item.$id)}
          containerStyles="p-3 mt-5"
        />
      ) : item.indice_fluxo === '1' ? (
        <CustomButton
          title="Assinar Contrato"
          handlePress={() => handleSign(item.$id)}
          containerStyles="p-3 mt-5"
        />
      ) : null}
    </View>
  );

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
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Escolha o Tipo de Contrato
            </Text>
            <CustomButton title="Contrato Mensal" handlePress={() => iniciarAssinatura('mensal', selectedAlunoId)} containerStyles="mb-4" />
            <CustomButton title="Contrato Semestral" handlePress={() => iniciarAssinatura('semestral', selectedAlunoId)} containerStyles="mb-4" />
            <CustomButton title="Contrato Anual" handlePress={() => iniciarAssinatura('anual', selectedAlunoId)} containerStyles="mb-4" />
            <CustomButton title="Cancelar" handlePress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal para ações do aluno (Assinar ou Trocar Matrícula) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSignVisible}
        onRequestClose={() => setModalSignVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Ações do Aluno {selectedAluno?.username}
            </Text>
            <CustomButton title="Assinar" handlePress={assinarContrato()} containerStyles="mb-4" />
            <CustomButton title="Trocar Matrícula" handlePress={() => cancelarMatricula(selectedAluno)} containerStyles="mb-4" />
            <CustomButton title="Cancelar" handlePress={() => setModalSignVisible(false)} />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Profile;
