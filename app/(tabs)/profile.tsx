import React, { useState, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, RefreshControl, Alert, ActivityIndicator, Modal, TouchableHighlight } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, getAlunosByUserId, getPdfUrl, updateAlunoContrato, getUsersByUserId, updateAlunoFluxo, updateAlunoFatura, createCustomer, createInvoicesForContract} from '@/lib/appwrite';  
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
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSignVisible, setModalSignVisible] = useState(false);
  const [modalFaturaVisible, setModalFaturaVisible] = useState(false);
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

  const handleFatura = (alunoId) => {
    setSelectedAlunoId(alunoId);
    setModalFaturaVisible(true);
  };

  const salvarDiaFatura = async (dia) => {
    try {
      // Salva o dia da fatura no banco de dados do aluno
      await updateAlunoFatura(selectedAlunoId, { dia_cobranca: String(dia) });
      setModalFaturaVisible(false);
  
      const aluno = alunos.find(a => a.$id === selectedAlunoId);
      // Busca as informações do aluno para criar o cliente na Stripe
      const userInfo = await getUsersByUserId(user.userId);
  
      // Configura o corpo da solicitação que será enviado para o webhook
      const requestBody = {
        username: userInfo.username,
        email: userInfo.email,
        cpf: userInfo.cpf,
        tipoContrato: aluno.tipo_contrato,
        diaCobranca: dia,
      };
  
      console.log('Body: ', requestBody);
  
      // Envia os dados para o webhook usando uma solicitação HTTP POST
      const response = await fetch('https://67043cc10d94757fffc7.appwrite.global/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      // Lê a resposta como texto para entender o que está sendo retornado
      const responseText = await response.text();
      console.log('Response Text: ', responseText);
  
      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro ao criar faturas: ${responseText}`);
      }
  
      // Tenta analisar a resposta como JSON
      const responseData = JSON.parse(responseText);
  
      if (responseData.success) {
        Alert.alert('Sucesso', 'As faturas foram criadas e enviadas por e-mail.');
      } else {
        throw new Error(responseData.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar dia da fatura e criar faturas:', error);
      Alert.alert('Erro', 'Não foi possível salvar o dia da fatura e criar os boletos.');
    }
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
        tipoContrato: aluno.tipo_contrato
      });
      setModalSignVisible(true);
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
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
      const year = today.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const aluno = alunos.find(a => a.$id === selectedAluno.id);
      const tipoContrato = aluno.tipo_contrato;
      const tokenContrato = gerarTokenContrato();
  
      const pdfUrl = await getPdfUrl(getFileIdByTipoContrato(tipoContrato));
      if (!pdfUrl) {
        Alert.alert('Erro', 'Não foi possível carregar o contrato.');
        return;
      }
  
      // Faz o download do PDF do contrato para o sistema de arquivos local
      const localPdfPath = `${FileSystem.documentDirectory}contrato-original.pdf`;
      await FileSystem.downloadAsync(pdfUrl, localPdfPath);
  
      // Lê o arquivo PDF baixado como Base64
      const pdfBase64 = await FileSystem.readAsStringAsync(localPdfPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Carrega o PDF para edição usando o conteúdo Base64
      const pdfDoc = await PDFDocument.load(pdfBase64, { updateMetadata: true });
  
      // Cria um novo PDF para a assinatura
      const signaturePdfDoc = await PDFDocument.create();
      const page = signaturePdfDoc.addPage([600, 200]);
      page.drawText('Assinado por: ', {
        x: 50,
        y: 150,
        size: 14,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Responsável: ${selectedAluno.createdByUsername}, CPF: ${selectedAluno.createdByCpf}`, {
        x: 50,
        y: 120,
        size: 14,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Aluno: ${selectedAluno.username}, RG: ${selectedAluno.rg}`, {
        x: 50,
        y: 90,
        size: 14,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Data da Assinatura: ${formattedDate}`, {
        x: 50,
        y: 60,
        size: 14,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Token de Assinatura: ${tokenContrato}`, {
        x: 50,
        y: 30,
        size: 14,
        color: rgb(0, 0, 0),
      });
  
      const signaturePdfBytes = await signaturePdfDoc.save();
  
      // Carrega o PDF da assinatura usando o Base64
      const signaturePdf = await PDFDocument.load(signaturePdfBytes);
  
      // Cria um novo documento que irá mesclar os PDFs
      const mergedPdfDoc = await PDFDocument.create();
  
      // Copia todas as páginas do contrato para o novo PDF
      const contractPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      contractPages.forEach((page) => mergedPdfDoc.addPage(page));
  
      // Copia a página da assinatura para o novo PDF
      const signaturePages = await mergedPdfDoc.copyPages(signaturePdf, [0]);
      signaturePages.forEach((page) => mergedPdfDoc.addPage(page));
  
      // Salva o PDF mesclado como Base64
      const mergedPdfBytes = await mergedPdfDoc.save();
      const mergedPdfBuffer = Buffer.from(mergedPdfBytes);

      // Compartilhar ou abrir o PDF utilizando expo-sharing
      const mergedPdfPath = `${FileSystem.documentDirectory}contrato-assinado.pdf`;
      await FileSystem.writeAsStringAsync(mergedPdfPath, mergedPdfBuffer.toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(mergedPdfPath);
      } else {
        Alert.alert('Erro', 'Compartilhamento não está disponível no dispositivo.');
      }

      await updateAlunoFluxo(selectedAluno.id, { indice_fluxo: '2', token_contrato: tokenContrato });


  
      setModalSignVisible(false);
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
      ) : item.indice_fluxo === '2' ? (
        <CustomButton
        title="Dia da Fatura"
        handlePress={() => handleFatura(item.$id)}
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
            <CustomButton title="Assinar" handlePress={() => assinarContrato(selectedAluno)} containerStyles="mb-4" />
            <CustomButton title="Trocar Matrícula" handlePress={() => cancelarMatricula(selectedAluno)} containerStyles="mb-4" />
            <CustomButton title="Cancelar" handlePress={() => setModalSignVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalFaturaVisible}
        onRequestClose={() => setModalFaturaVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, height: 400, backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Selecione o Dia da Fatura
            </Text>
            <FlatList
              data={Array.from({ length: 30 }, (_, i) => i + 1)}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableHighlight
                  underlayColor="#DDDDDD"
                  onPress={() => salvarDiaFatura(item)}
                  style={{ padding: 10, marginVertical: 4, backgroundColor: '#F5F5F5', borderRadius: 5 }}
                >
                  <Text style={{ textAlign: 'center', fontSize: 16 }}>{item}</Text>
                </TouchableHighlight>
              )}
            />
            <CustomButton title="Cancelar" handlePress={() => setModalFaturaVisible(false)} containerStyles="mt-4" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
