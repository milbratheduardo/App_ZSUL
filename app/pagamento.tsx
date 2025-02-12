import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos } from '@/lib/appwrite';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { handlePixPaymentMP, handlePixPaymentMP2, handlePixPaymentMP3 } from '../utils/MPIntegration';
import { updateStatusPagamento, createHistoricoPagamentos } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput,RefreshControl  } from 'react-native';

const Pagamentos2 = () => {
  const { user } = useGlobalContext();
  const [couponCode, setCouponCode] = useState('');
  const [handleApplyCoupon, sethandleApplyCoupon] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mensagemPlano, setMensagemPlano] = useState('');
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
  const [alunosComDesconto, setAlunosComDesconto] = useState(0);
  const [alunos50, setAlunos50] = useState(0);
  const router = useRouter();
  const [planos, setPlanos] = useState([
    { id: '2c93808493b073170193d2317ddb0ac2', title: 'Mensal', price: 100 },
    { id: '2c93808493b072d70193d233e9eb0b23', title: 'Semestral', price: 90 },
    { id: '2c93808493b072d80193d234fe0e0b24', title: 'Anual', price: 80 },
  ]);
  

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const allAlunos = await getAllAlunos();

      const alunosFiltrados = allAlunos.filter(
        (aluno) => aluno.nomeResponsavel === user.cpf && aluno.status_pagamento == null
      );
      setAlunos(alunosFiltrados);

      const alunosprodesconto = allAlunos.filter(
        (aluno) => aluno.nomeResponsavel === user.cpf
      );

      const countDesconto = alunosprodesconto.filter((aluno) => aluno.desconto === 'sim').length;
      setAlunosComDesconto(countDesconto);

      // Atualize os planos dinamicamente
      setPlanos(
        countDesconto > 0
          ? [
              { id: '2c9380849469a4a101946ae6d35700aa', title: 'Mensal', price: 50 },
              { id: '2c9380849469a43201946ae4a44100a4', title: 'Semestral', price: 45 },
              { id: '2c9380849469a43201946add8ee300a0', title: 'Anual', price: 40 },
            ]
          : [
              { id: '2c93808493b073170193d2317ddb0ac2 ', title: 'Mensal', price: 100 },
              { id: '2c93808493b072d70193d233e9eb0b23', title: 'Semestral', price: 90 },
              { id: '2c93808493b072d80193d234fe0e0b24', title: 'Anual', price: 80 },
            ]
      );
    } catch (error) {
      setErrorMessage(`Não foi possível carregar os alunos.`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [user.cpf]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlunos(); 
    setRefreshing(false);
  };

  const handleAlunoSelect = (aluno) => {
    setSelectedAluno(aluno);
  
    if (aluno.off === '50Off') {
      setPlanos([
        {
          id: '2c9380849469a43201946ae827c500a9',
          title: 'Mensal',
          price: 50,
        },
      ]);
      setSelectedPlan('2c9380849469a43201946ae827c500a9'); 
      setMensagemPlano(
        'Plano especial com desconto de 50%.'
      );
    } else {
      // Voltar para os planos normais
      setPlanos(
        alunosComDesconto > 0
          ? [
              { id: '2c9380849469a4a101946ae6d35700aa', title: 'Mensal', price: 50 },
              { id: '2c9380849469a43201946ae4a44100a4', title: 'Semestral', price: 45 },
              { id: '2c9380849469a43201946add8ee300a0', title: 'Anual', price: 40 },
            ]
          : [
              { id: '2c93808493b073170193d2317ddb0ac2', title: 'Mensal', price: 100 },
              { id: '2c93808493b072d70193d233e9eb0b23', title: 'Semestral', price: 90 },
              { id: '2c93808493b072d80193d234fe0e0b24', title: 'Anual', price: 80 },
            ]
      );
      setSelectedPlan(null);
      setMensagemPlano('');
    }
  };
  

  const handlePlanSelect = (plano) => {
    setSelectedPlan(plano.id);
    switch (plano.title) {
      case 'Mensal':
        setMensagemPlano('Este plano é ideal para quem deseja flexibilidade, com renovação mensal.');
        break;
      case 'Semestral':
        setMensagemPlano('Este plano oferece um contrato único com validade de 6 meses, sem possibilidade de cancelamento. O valor será debitado automaticamente do crédito recorrente, sem impactar o limite disponível.');
        break;
      case 'Anual':
        setMensagemPlano('Este plano oferece um contrato único com validade de 1 ano, sem possibilidade de cancelamento. O valor será debitado automaticamente do crédito recorrente, sem impactar o limite disponível.');
        break;
      default:
        setMensagemPlano('');
    }
  };

  const handleContinue = () => {
    if (!selectedPlan || !selectedAluno || !termsAccepted) {
      setErrorMessage(`Selecione um plano, um aluno e aceite os termos.`);
      setShowErrorModal(true);
      return;
    }

    router.push({
      pathname: '/cartao',
      params: {
        plan_id: selectedPlan,
        userId: user.userId,
        atletaId: selectedAluno.userId,
      },
    });
  };

  const handlePixPayment = async () => {
    if (!selectedPlan || !selectedAluno || !termsAccepted) {
      Alert.alert('Erro', 'Selecione um plano, um aluno e aceite os termos.');
      return;
    }
  
    try {
      setLoading(true);

      const cupom = alunosComDesconto > 0 ? null : 'sim';

      const pixResponse =
      selectedPlan === '2c93808493b073170193d2317ddb0ac2'
        ? await handlePixPaymentMP(user.email, user.cpf, user.nome)
        : await handlePixPaymentMP3(user.email, user.cpf, user.nome);
  
      if (pixResponse && pixResponse.id && pixResponse.point_of_interaction?.transaction_data?.ticket_url) {
        const pixUrl = pixResponse.point_of_interaction.transaction_data.ticket_url;
  
        const paymentId = pixResponse.charges_details?.[0]?.id || pixResponse.id;
        
        const planId = cupom === null 
          ? 'Pix Mensal - Pendente' 
          : 'Pix Mensal - Pendente (Irmãos)';
        
  
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const formattedEndDate = endDate.toISOString();
  
        // Atualiza o status do pagamento
        await updateStatusPagamento(selectedAluno.userId, planId, paymentId, formattedEndDate, cupom);
  
        // Cria o histórico do pagamento
        await createHistoricoPagamentos(
          selectedAluno.userId,
          selectedAluno.nome,
          selectedAluno.cpf,
          selectedAluno.nomeResponsavel,
          planId,
          formattedEndDate,
          paymentId
        );
  
        Linking.openURL(pixUrl);
      } else {
        throw new Error('URL Pix ou ID da transação não encontrada.');
      }
    } catch (error) {
      setErrorMessage(`Falha ao gerar pix. Verifique seu CPF.`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };


  const handlePixPayment2 = async () => {
    if (!selectedPlan || !selectedAluno || !termsAccepted) {
      Alert.alert('Erro', 'Selecione um plano, um aluno e aceite os termos.');
      return;
    }
  
    try {
      setLoading(true);

      const cupom = alunosComDesconto > 0 ? null : 'sim';

      const pixResponse = await handlePixPaymentMP2(user.email, user.cpf, user.nome);
  
      if (pixResponse && pixResponse.id && pixResponse.point_of_interaction?.transaction_data?.ticket_url) {
        const pixUrl = pixResponse.point_of_interaction.transaction_data.ticket_url;
        
        console.log('Selected Plan: ', selectedPlan)
        console.log('Resposta Pix: ', pixUrl);
        const paymentId = pixResponse.charges_details?.[0]?.id || pixResponse.id;
        
        const planId = 'Pix Mensal - Pendente (50%)' ;
        
  
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const formattedEndDate = endDate.toISOString();
  
        // Atualiza o status do pagamento
        await updateStatusPagamento(selectedAluno.userId, planId, paymentId, formattedEndDate, cupom);
  
        // Cria o histórico do pagamento
        await createHistoricoPagamentos(
          selectedAluno.userId,
          selectedAluno.nome,
          selectedAluno.cpf,
          selectedAluno.nomeResponsavel,
          planId,
          formattedEndDate,
          paymentId
        );
  
        Linking.openURL(pixUrl);
      } else {
        throw new Error('URL Pix ou ID da transação não encontrada.');
      }
    } catch (error) {
      setErrorMessage(`Falha ao gerar pix.`);
      setShowErrorModal(true);
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
  
      // Utilize alunosComDesconto para definir cupom
      const cupom = alunosComDesconto > 0 ? null : 'sim';
  
      let planId = '';
      const endDate = new Date();
  
      switch (selectedPlan) {
        case '2c93808493b073170193d2317ddb0ac2':
          planId = 'Pendente em Dinheiro - Mensal';
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '2c93808493b072d70193d233e9eb0b23':
          planId = 'Pendente em Dinheiro - Semestral';
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '2c93808493b072d80193d234fe0e0b24':
          planId = 'Pendente em Dinheiro - Anual';
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case '2c9380849469a4a101946ae6d35700aa':
          planId = 'Pendente em Dinheiro - Irmãos Mensal';
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '2c9380849469a43201946ae4a44100a4':
          planId = 'Pendente em Dinheiro - Irmãos Semestral';
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '2c9380849469a43201946add8ee300a0':
          planId = 'Pendente em Dinheiro - Irmãos Anual';
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case '2c9380849469a43201946ae827c500a9':
          planId = 'Pendente em Dinheiro - 50Off';
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          throw new Error('Plano inválido.');
      }
  
      const formattedEndDate = endDate.toISOString();
  
      // Atualiza o status do pagamento
      await updateStatusPagamento(selectedAluno.userId, planId, '---', formattedEndDate, cupom);
  
      // Cria o histórico do pagamento
      await createHistoricoPagamentos(
        selectedAluno.userId,
        selectedAluno.nome,
        selectedAluno.cpf,
        selectedAluno.nomeResponsavel,
        planId,
        formattedEndDate,
        '---'
      );
  
      Alert.alert('Sucesso', 'Pagamento registrado com sucesso!');
      onRefresh();
    } catch (error) {
      setErrorMessage('Falha ao registrar pagamento.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#126046']} />
      }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selecione um Plano e um Aluno</Text>
        </View>

        <View style={styles.alunoList}>
          <Text style={styles.sectionTitle}>Alunos</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#126046" />
              <Text style={styles.emptyStateText}>Carregando...</Text>
            </View>
          ) : (
            alunos.map((aluno) => (
              <TouchableOpacity
                key={aluno.$id}
                style={[styles.alunoCard, selectedAluno?.userId === aluno.userId && styles.selected]}
                onPress={() => handleAlunoSelect(aluno)}
              >
                <Text style={styles.alunoName}>{aluno.nome}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {planos.map((plano) => (
            <TouchableOpacity
              key={plano.id}
              style={[styles.planCard, selectedPlan === plano.id && styles.selected]}
              onPress={() => handlePlanSelect(plano)}
            >
              <Text style={styles.planTitle}>{plano.title}</Text>
              {alunosComDesconto !== 0 && (
                <Text style={styles.planPrice}>R$ {plano.price},00</Text>
              )}

              {alunosComDesconto == 0 && (
                <Text>R$ {plano.price},00</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {mensagemPlano !== '' && (
          <View style={styles.mensagemContainer}>
            <Text style={styles.mensagemTexto}>{mensagemPlano}</Text>
          </View>
        )}

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={termsAccepted}
            onValueChange={setTermsAccepted}
            color={termsAccepted ? '#126046' : undefined}
          />
          <Text style={styles.checkboxText}>
            Li e Aceito os{' '}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL(
                  'https://cloud.appwrite.io/v1/storage/buckets/66fee5cf002a7360f3c4/files/6761fb43003481448d18/view?project=66acd9e100124f502bd9&project=66acd9e100124f502bd9&mode=admin'
                )
              }
            >
              termos do contrato
            </Text>
          </Text>
        </View>
        <View style={styles.couponContainer}>
      </View>

        <Text style={styles.contractNote}>*Levar contrato preenchido no próximo treino</Text>

        {selectedPlan && selectedAluno && termsAccepted && (
          <>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                { backgroundColor: '#28a745', flexDirection: 'row', alignItems: 'center' },
              ]}
              onPress={handleContinue}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="credit-card" size={24} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.paymentButtonText}>Cartão de Crédito</Text>
                </>
              )}
            </TouchableOpacity>

            {(selectedPlan === '2c9380849469a43201946ae827c500a9' || selectedPlan === '2c9380849469a4a101946ae6d35700aa' || selectedPlan === '2c93808493b073170193d2317ddb0ac2') && (
              <>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    { backgroundColor: '#161622', flexDirection: 'row', alignItems: 'center' },
                  ]}
                  onPress={handleCashPayment}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="cash-multiple" size={24} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.paymentButtonText}>Pagar em Dinheiro</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    { backgroundColor: '#FFC107', flexDirection: 'row', alignItems: 'center' },
                  ]}
                  onPress={selectedAluno.off === "50Off" ? handlePixPayment2 : handlePixPayment}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.paymentButtonText}>Pagar com Pix</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}

      </ScrollView>
             <Modal
                visible={showErrorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowErrorModal(false)}
              >
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                  <View style={{
                    backgroundColor: 'red',
                    padding: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    width: '80%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
                      Erro
                    </Text>
                    <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
                      {errorMessage}
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 5,
                      }}
                      onPress={() => setShowErrorModal(false)}
                    >
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>Fechar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
    </SafeAreaView>
  );
};

export default Pagamentos2;

const styles = StyleSheet.create({
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#126046',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 30 },
  header: { paddingVertical: 24, paddingHorizontal: 20, backgroundColor: '#126046', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  carousel: { paddingHorizontal: 16, marginBottom: 10 },
  planCard: {
    width: 100,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    elevation: 3,
  },
  selected: { borderColor: '#126046', borderWidth: 2 },
  mensagemContainer: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: '#F0F8F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#126046',
  },
  planPrice:{
    color: 'red',

  },
  mensagemTexto: {
    fontSize: 14,
    color: '#126046',
    textAlign: 'center',
  },
  alunoList: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  alunoCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    elevation: 3,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, marginHorizontal: 16 },
  checkboxText: { marginLeft: 8, fontSize: 14, color: '#333' },
  link: { color: '#126046', textDecorationLine: 'underline' },
  contractNote: { fontSize: 12, color: '#888', marginHorizontal: 16 },
  paymentButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
