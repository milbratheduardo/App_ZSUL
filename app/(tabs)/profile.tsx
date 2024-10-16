import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, getAlunosByUserId, getPdfUrl, updateAlunoContrato, getUsersByUserId, updateAlunoFluxo, updateAlunoFatura } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '@/constants';
import EmptyState from '@/components/EmptyState';
import InfoBox from '@/components/InfoBox';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

const Profile = () => {
  const { user, setUser } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCertezaVisible, setModalCertezaVisible] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [modalCienteVisible, setModalCienteVisible] = useState(false);

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

  const handlePayment = async (alunoId) => {
    try {
      const checkoutUrl = 'https://buy.stripe.com/test_8wMeWJ5JMg5X4mcaEE';  // URL gerada no dashboard do Stripe
  
      // Redireciona para o link de pagamento
      Linking.openURL(checkoutUrl);
  
      // Faz o update da coluna pagamento para '1'
      await updateAlunoFatura(alunoId, { pagamento: '1' });
  
      Alert.alert('Sucesso', 'Pagamento atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      Alert.alert('Erro', 'Não foi possível processar o pagamento.');
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

  const handleCiencia = (alunoId) => {
    setSelectedAlunoId(alunoId);
    setModalCienteVisible(true);
  };

  const certezaPagamento = (alunoId) => {
    setSelectedAlunoId(alunoId);
    setModalCertezaVisible(true);
  };

  const getFileIdByTipoContrato = (tipoContrato) => {
    switch (tipoContrato) {
      case 'mensal':
        return '670f26c80037cfdd8729';
      case 'semestral':
        return '670f26c80037cfdd8729';
      case 'anual':
        return '670f26c80037cfdd8729';
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

  const handleSign = async (alunoId) => {
    try {
      const aluno = alunos.find(a => a.$id === alunoId);
      const userData = await getUsersByUserId(aluno.createdByUserId);
      const selectedAluno = {
        id: aluno.$id,
        username: aluno.username,
        rg: aluno.rg,
        createdByUsername: userData.username,
        createdByCpf: userData.cpf,
        tipoContrato: aluno.tipo_contrato,
      };
      assinarContrato(selectedAluno);
    } catch (error) {
      console.error('Erro ao buscar dados do aluno e do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados para assinatura.');
    }
  };

  const gerarTokenContrato = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 15; i++) {
      token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return token;
  };

  const assinarContrato = async (selectedAluno) => {
    try {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      const tokenContrato = gerarTokenContrato();

      const pdfUrl = await getPdfUrl(getFileIdByTipoContrato(selectedAluno.tipoContrato));
      if (!pdfUrl) {
        Alert.alert('Erro', 'Não foi possível carregar o contrato.');
        return;
      }

      const localPdfPath = `${FileSystem.documentDirectory}contrato-original.pdf`;
      await FileSystem.downloadAsync(pdfUrl, localPdfPath);

      const pdfBase64 = await FileSystem.readAsStringAsync(localPdfPath, { encoding: FileSystem.EncodingType.Base64 });
      const pdfDoc = await PDFDocument.load(pdfBase64, { updateMetadata: true });

      const signaturePdfDoc = await PDFDocument.create();
      const page = signaturePdfDoc.addPage([600, 200]);
      page.drawText('Assinado por: ', { x: 50, y: 150, size: 14, color: rgb(0, 0, 0) });
      page.drawText(`Responsável: ${selectedAluno.createdByUsername}, CPF: ${selectedAluno.createdByCpf}`, { x: 50, y: 120, size: 14, color: rgb(0, 0, 0) });
      page.drawText(`Aluno: ${selectedAluno.username}, RG: ${selectedAluno.rg}`, { x: 50, y: 90, size: 14, color: rgb(0, 0, 0) });
      page.drawText(`Data da Assinatura: ${formattedDate}`, { x: 50, y: 60, size: 14, color: rgb(0, 0, 0) });
      page.drawText(`Token de Assinatura: ${tokenContrato}`, { x: 50, y: 30, size: 14, color: rgb(0, 0, 0) });

      const signaturePdfBytes = await signaturePdfDoc.save();
      const signaturePdf = await PDFDocument.load(signaturePdfBytes);

      const mergedPdfDoc = await PDFDocument.create();
      const contractPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      contractPages.forEach((page) => mergedPdfDoc.addPage(page));
      const signaturePages = await mergedPdfDoc.copyPages(signaturePdf, [0]);
      signaturePages.forEach((page) => mergedPdfDoc.addPage(page));

      const mergedPdfBytes = await mergedPdfDoc.save();
      const mergedPdfBuffer = Buffer.from(mergedPdfBytes);

      const mergedPdfPath = `${FileSystem.documentDirectory}contrato-assinado.pdf`;
      await FileSystem.writeAsStringAsync(mergedPdfPath, mergedPdfBuffer.toString('base64'), { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(mergedPdfPath);
      } else {
        Alert.alert('Erro', 'Compartilhamento não está disponível no dispositivo.');
      }

      await updateAlunoFluxo(selectedAluno.id, { indice_fluxo: '2', token_contrato: tokenContrato });
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
      position: 'relative', // Para poder posicionar o texto no canto superior direito
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{item.username}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.nascimento}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.escola}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{item.ano}</Text>
  
      {item.pagamento === '1' ? (
        <Text style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'blue',
          fontWeight: 'bold',
        }}>Esperando Aprovação</Text>
      ) : item.pagamento === '2' ? (
        <Text style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'green',
          fontWeight: 'bold',
        }}>Pagamento Confirmado</Text>
      ) : (
        <>
          {item.indice_fluxo === null || item.indice_fluxo === '' ? (
            <CustomButton
              title="Visualizar Contrato"
              handlePress={() => handleAssinarContrato(item.$id)}
              containerStyles="p-3 mt-5"
            />
          ) : item.indice_fluxo === '1' ? (
            <CustomButton
              title="Assinar Contrato"
              handlePress={() => handleCiencia(item.$id)}
              containerStyles="p-3 mt-5"
            />
          ) : item.indice_fluxo === '2' ? (
            <CustomButton
              title="Pagamento"
              handlePress={() => certezaPagamento(item.$id)}
              containerStyles="p-3 mt-5"
            />
          ) : null}
        </>
      )}
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
             {user.role === 'admin' && (
              <CustomButton
                title="Aprovar pagamentos"
                handlePress={() => router.push('/aprovar_pagamentos')}
                containerStyles="p-3 mt-10"
              />
            )}

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
            <CustomButton title="Cancelar" handlePress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCertezaVisible}
        onRequestClose={() => setModalCertezaVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Você tem certeza que quer pagar agora?
            </Text>
            <CustomButton title="Pagar" handlePress={() => handlePayment(selectedAlunoId)} containerStyles="mb-4" />
            <CustomButton title="Cancelar" handlePress={() => setModalCertezaVisible(false)} />
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCienteVisible}
        onRequestClose={() => setModalCienteVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Estou ciente com o que li no contrato.
            </Text>
            <CustomButton title="Sim" handlePress={() => handleSign(selectedAlunoId)} containerStyles="mb-4" />
            <CustomButton title="Cancelar" handlePress={() => setModalCienteVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
