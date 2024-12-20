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
import { handlePixPaymentMP } from '../utils/MPIntegration';
import { updateStatusPagamento } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Pagamentos2 = () => {
  const { user } = useGlobalContext();
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
  const router = useRouter();

  const planos = [
    { id: '2c93808493b072d70193be7c14b30582', title: 'Mensal', price: 45 },
    { id: '2c93808493b072d80193be79bea105ac', title: 'Semestral', price: 50 },
    { id: '2c93808493b073170193be7a300c053f', title: 'Anual', price: 60 },
  ];

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoading(true);
        const allAlunos = await getAllAlunos();
        const alunosFiltrados = allAlunos.filter(
          (aluno) => aluno.nomeResponsavel === user.cpf && aluno.status_pagamento == null
        );
        setAlunos(alunosFiltrados);
      } catch (error) {
        setErrorMessage(`Não foi possível carregar os alunos.`);
        setShowErrorModal(true);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [user.cpf]);

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
      const pixResponse = await handlePixPaymentMP(user.email, user.cpf, user.nome);

      if (pixResponse && pixResponse.id && pixResponse.point_of_interaction?.transaction_data?.ticket_url) {
        const pixUrl = pixResponse.point_of_interaction.transaction_data.ticket_url;

        const paymentId =
          pixResponse.charges_details?.[0]?.id || pixResponse.id;
        const planId = 'Pix Mensal - Pendente';

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const formattedEndDate = endDate.toISOString();

        console.log('Chamando updateStatusPagamento...');
        await updateStatusPagamento(selectedAluno.userId, planId, paymentId, formattedEndDate);

        console.log('Redirecionando para Pix URL...');
        Linking.openURL(pixUrl);
      } else {
        throw new Error('URL Pix ou ID da transação não encontrada.');
      }
    } catch (error) {
      setErrorMessage(`Falha ao gerar pix.`);
      setShowErrorModal(true);
      console.error('Erro ao processar pagamento Pix:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selecione um Plano e um Aluno</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {planos.map((plano) => (
            <TouchableOpacity
              key={plano.id}
              style={[styles.planCard, selectedPlan === plano.id && styles.selected]}
              onPress={() => handlePlanSelect(plano)}
            >
              <Text style={styles.planTitle}>{plano.title}</Text>
              <Text style={styles.planPrice}>R$ {plano.price},00</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {mensagemPlano !== '' && (
          <View style={styles.mensagemContainer}>
            <Text style={styles.mensagemTexto}>{mensagemPlano}</Text>
          </View>
        )}

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
                onPress={() => setSelectedAluno(aluno)}
              >
                <Text style={styles.alunoName}>{aluno.nome}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

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

        <Text style={styles.contractNote}>*Levar contrato preenchido no próximo treino</Text>

        <TouchableOpacity
          style={[styles.paymentButton, !termsAccepted && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!termsAccepted}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Continuar</Text>}
        </TouchableOpacity>

        {selectedPlan === '2c93808493b072d70193be7c14b30582' && (
          <TouchableOpacity
            style={[styles.paymentButton, { backgroundColor: '#FFC107' }]}
            onPress={handlePixPayment}
            disabled={loading || !termsAccepted || !selectedAluno}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.paymentButtonText}>Pagar com Pix</Text>
            )}
          </TouchableOpacity>
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
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#126046',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#AAA' },
  paymentButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});
