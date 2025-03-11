import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAllAlunos, updateStatusFatura, updateStatusFaturaPix } from '@/lib/appwrite';
import Checkbox from 'expo-checkbox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { handlePixPaymentMP, handlePixPaymentMP2, handlePixPaymentMP3, handlePixPaymentMP4 } from '../utils/MPIntegration';
import { useGlobalContext } from '@/context/GlobalProvider';

const planos = [
  { id: '2c93808493b073170193d2317ddb0ac2', title: 'Mensal', price: 100 },
  { id: '2c93808493b072d70193d233e9eb0b23', title: 'Semestral', price: 90 },
  { id: '2c93808493b072d80193d234fe0e0b24', title: 'Anual', price: 80 },
  { id: '2c9380849469a4a101946ae6d35700aa', title: 'Mensal', price: 50 },
  { id: '2c9380849469a43201946ae4a44100a4', title: 'Semestral', price: 45 },
  { id: '2c9380849469a43201946add8ee300a0', title: 'Anual', price: 40 },
  { id: '2c9380849469a43201946ae827c500a9', title: 'Mensal com Desconto', price: 50 },
  { id: '2c9380849563a16501957c04c9b90c2c', title: 'Mensal', price: 25 },
  { id: '2c938084955cc48001957c03e73a0f95', title: 'Semestral', price: 25 },
  { id: '2c938084954560f50195499e713a0293', title: 'Anual', price: 25 },
];

const Pagamento3 = () => {
  const { atletaId, plano, planoId, docId } = useLocalSearchParams();
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        const alunos = await getAllAlunos();
        const aluno = alunos.find((a) => a.userId === atletaId);
        setSelectedAluno(aluno);
      } catch (error) {
        console.error('Erro ao buscar aluno:', error.message);
      }
    };
    fetchAluno();
  }, [atletaId]);

  const selectedPlan = planos.find((p) => p.id === planoId);

  const handlePixPayment = async () => {
    if (!selectedPlan || !selectedAluno || !termsAccepted) {
      Alert.alert('Erro', 'Selecione um plano, um aluno e aceite os termos.');
      return;
    }
  
    try {
      setLoading(true);
  
      let pixResponse;
      let status_pagamento = '';
  
      // Determina qual função chamar com base no plano
      if (selectedPlan.id === '2c9380849469a43201946ae827c500a9') {
        pixResponse = await handlePixPaymentMP2(user.email, user.cpf, user.nome);
        status_pagamento = 'Pix Mensal - Pendente (50%)';
      } else if (selectedPlan.id === '2c93808493b073170193d2317ddb0ac2') {
        pixResponse = await handlePixPaymentMP(user.email, user.cpf, user.nome);
        status_pagamento = 'Pix Mensal - Pendente';
      } else if (selectedPlan.id === '2c9380849469a4a101946ae6d35700aa') {
        pixResponse = await handlePixPaymentMP3(user.email, user.cpf, user.nome);
        status_pagamento = 'Pix Irmãos Mensal - Pendente';
      } else if (selectedPlan.id === '2c9380849563a16501957c04c9b90c2c') {
        pixResponse = await handlePixPaymentMP4(user.email, user.cpf, user.nome);
        status_pagamento = 'Pix 3 Irmãos Mensal - Pendente';
      } else {
        throw new Error('Plano inválido para pagamento via Pix.');
      }
  
      // Se a resposta do Pix foi bem-sucedida
      if (pixResponse && pixResponse.id && pixResponse.point_of_interaction?.transaction_data?.ticket_url) {
        const pixUrl = pixResponse.point_of_interaction.transaction_data.ticket_url;
        const paymentId = pixResponse.charges_details?.[0]?.id || pixResponse.id;
  
        console.log('Selected Plan:', selectedPlan);
        console.log('Resposta Pix:', pixUrl);
  
        // Atualiza o status do pagamento no banco
        await updateStatusFaturaPix(docId, status_pagamento, paymentId);
  
        // Abre o link do Pix
        Linking.openURL(pixUrl);
      } else {
        throw new Error('URL Pix ou ID da transação não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao gerar Pix:', error);
      Alert.alert('Erro', 'Falha ao gerar Pix.');
    } finally {
      setLoading(false);
    }
  };
  


  const handleCashPayment = async () => {
    if (!selectedPlan || !selectedAluno || !termsAccepted) {
      Alert.alert('Erro', 'Selecione um plano, um aluno e aceite os termos.');
      return;
    }
  
    try {
      setLoading(true);
  
      let status_pagamento = '';
  
      switch (selectedPlan.id) {
        case '2c93808493b073170193d2317ddb0ac2':
          status_pagamento = 'Pendente em Dinheiro - Mensal';
          break;
        case '2c93808493b072d70193d233e9eb0b23':
          status_pagamento = 'Pendente em Dinheiro - Semestral';
          break;
        case '2c93808493b072d80193d234fe0e0b24':
          status_pagamento = 'Pendente em Dinheiro - Anual';
          break;
        case '2c9380849469a4a101946ae6d35700aa':
          status_pagamento = 'Pendente em Dinheiro - Irmãos Mensal';
          break;
        case '2c9380849469a43201946ae4a44100a4':
          status_pagamento = 'Pendente em Dinheiro - Irmãos Semestral';
          break;
        case '2c9380849469a43201946add8ee300a0':
          status_pagamento = 'Pendente em Dinheiro - Irmãos Anual';
          break;
        case '2c9380849469a43201946ae827c500a9':
          status_pagamento = 'Pendente em Dinheiro - 50Off';
          break;
        case '2c9380849563a16501957c04c9b90c2c':
          status_pagamento = 'Pendente em Dinheiro - 3 Irmãos Mensal';
          break;
        case '2c938084955cc48001957c03e73a0f95':
          status_pagamento = 'Pendente em Dinheiro - 3 Irmãos Semestral';
          break;
        case '2c938084954560f50195499e713a0293':
          status_pagamento = 'Pendente em Dinheiro - 3 Irmãos Anual';
          break;
        default:
          throw new Error('Plano inválido.');
      }
  
      // Atualiza o status do pagamento no banco
      await updateStatusFatura(docId, status_pagamento);
  
      // Registra o pagamento no histórico
      
  
      Alert.alert('Sucesso', 'Pagamento registrado com sucesso!');
      router.push('/profile'); // Redireciona para a tela de confirmação
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      Alert.alert('Erro', 'Falha ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escolha o Método de Pagamento</Text>
        <Text style={styles.headerSubtitle}>{selectedAluno?.nome}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{selectedPlan?.title}</Text>
        <Text style={styles.cardPrice}>R$ {selectedPlan?.price},00</Text>
      </View>
      
      <View style={styles.checkboxContainer}>
        <Checkbox value={termsAccepted} onValueChange={setTermsAccepted} color={termsAccepted ? '#126046' : undefined} />
        <Text style={styles.checkboxText}>
          Li e Aceito os{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://cloud.appwrite.io/v1/storage/buckets/66fee5cf002a7360f3c4/files/6761fb43003481448d18/view?project=66acd9e100124f502bd9&project=66acd9e100124f502bd9&mode=admin')}
          >
            termos do contrato
          </Text>
        </Text>
      </View>
      
      {selectedPlan && selectedAluno && termsAccepted && (
        <>
          <TouchableOpacity style={[styles.paymentButton, { backgroundColor: '#28a745' }]} onPress={() => router.push({ pathname: '/cartao', params: { plan_id: planoId, atletaId, docId } })}>
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#FFF" />
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Cartão de Crédito</Text>}
            </View>
          </TouchableOpacity>
          {(planoId === '2c9380849469a43201946ae827c500a9' || planoId === '2c9380849469a4a101946ae6d35700aa' || planoId === '2c93808493b073170193d2317ddb0ac2') && (
            <>
              <TouchableOpacity style={[styles.paymentButton, { backgroundColor: '#161622' }]} onPress={handleCashPayment}>
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#FFF" />
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Pagar em Dinheiro</Text>}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.paymentButton, { backgroundColor: '#FFC107' }]} onPress={handlePixPayment}>
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFF" />
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Pagar com Pix</Text>}
                </View>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  header: { paddingVertical: 24, paddingHorizontal: 20, backgroundColor: '#126046', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 18, color: '#D1FAE5', marginTop: 4 },
  card: { padding: 20, backgroundColor: '#FFF', borderRadius: 10, marginBottom: 20, shadowOpacity: 0.1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardPrice: { fontSize: 16, color: '#444', marginTop: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxText: { marginLeft: 10, fontSize: 14, color: '#333' },
  link: { color: '#126046', textDecorationLine: 'underline' },
  paymentButton: { padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  paymentButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default Pagamento3;








