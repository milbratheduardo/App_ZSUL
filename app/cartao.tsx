import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAlunosById, updateStatusPagamento, createHistoricoPagamentos } from '@/lib/appwrite';
import { createCardToken, handleIntegrationMP } from '../utils/MPIntegration';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Cartao = () => {
  const { user } = useGlobalContext();
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    expiration_month: '',
    expiration_year: '',
    security_code: '',
    cardholder_name: '',
    cardholder_cpf: '',
  });

  const { plan_id, userId, atletaId } = useLocalSearchParams();

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        setLoading(true);
        const alunoData = await getAlunosById(atletaId);
        setAluno(alunoData);
      } catch (error) {
        setErrorMessage(`Falha ao buscar dados do aluno.`);
        setShowErrorModal(true);
       
      } finally {
        setLoading(false);
      }
    };

    fetchAluno();
  }, [atletaId]);

  const handlePayment = async () => {
    if (!user?.email) {
      setErrorMessage(`Usuário não identificado`);
      setShowErrorModal(true);
      return;
    }
  
    const isCardDetailsValid = Object.values(cardDetails).every((field) => field.trim() !== '');
    if (!isCardDetailsValid) {
      setErrorMessage(`Preencha todas as informações do cartão.`);
      setShowErrorModal(true);
      return;
    }
  
    try {
      setLoading(true);
      const cardTokenId = await createCardToken({
        card_number: cardDetails.card_number,
        expiration_month: cardDetails.expiration_month,
        expiration_year: cardDetails.expiration_year,
        security_code: cardDetails.security_code,
        cardholder: {
          name: cardDetails.cardholder_name,
          identification: {
            type: 'CPF',
            number: cardDetails.cardholder_cpf,
          },
        },
      });
  
      const result = await handleIntegrationMP(user.email, cardTokenId, plan_id);
  
      if (result.status === 'authorized') {
        const formattedEndDate = result.auto_recurring?.end_date || new Date().toISOString();
  
        // Atualiza o status do pagamento
        const updatedAluno = await updateStatusPagamento(
          atletaId,
          plan_id,
          result.id,
          formattedEndDate
        );
  
        // Cria o histórico do pagamento
        await createHistoricoPagamentos(
          atletaId,
          aluno?.nome || 'Nome não informado',
          aluno?.cpf || 'CPF não informado',
          aluno?.nomeResponsavel || 'Responsável não informado',
          plan_id,
          formattedEndDate,
          result.id
        );
  
        setSuccessMessage('Pagamento Realizado com Sucesso!');
        setShowSuccessModal(true);
      } else {
        setErrorMessage(`Erro, pagamento não foi concluído.`);
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(`Erro ao processar pagamento.`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finalize o Pagamento</Text>
          {aluno && (
            <Text style={styles.headerSubtitle}>
              Responsável: {user.nome} | Aluno: {aluno.nome}
            </Text>
          )}
        </View>

        {/* Cartão Visual */}
        <View style={styles.cardVisual}>
          <Text style={styles.cardNumber}>{
            cardDetails.card_number.replace(/(.{4})/g, '$1 ').trim() || '**** **** **** ****'
          }</Text>
          <View style={styles.cardDetailsRow}>
            <Text style={styles.cardText}>{
              cardDetails.cardholder_name.toUpperCase() || 'NOME DO TITULAR'
            }</Text>
            <Text style={styles.cardText}>{
              cardDetails.expiration_month && cardDetails.expiration_year
                ? `${cardDetails.expiration_month}/${cardDetails.expiration_year.slice(-2)}`
                : 'MM/AA'
            }</Text>
          </View>
        </View>

        {/* Formulário de Dados do Cartão */}
        <View style={styles.cardForm}>
          <TextInput
            style={styles.input}
            placeholder="Número do Cartão"
            keyboardType="number-pad"
            value={cardDetails.card_number}
            onChangeText={(text) => setCardDetails({ ...cardDetails, card_number: text })}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.smallInput]}
              placeholder="Mês (MM)"
              keyboardType="number-pad"
              value={cardDetails.expiration_month}
              onChangeText={(text) => setCardDetails({ ...cardDetails, expiration_month: text })}
            />
            <TextInput
              style={[styles.input, styles.smallInput]}
              placeholder="Ano (AAAA)"
              keyboardType="number-pad"
              value={cardDetails.expiration_year}
              onChangeText={(text) => setCardDetails({ ...cardDetails, expiration_year: text })}
            />
            <TextInput
              style={[styles.input, styles.smallInput]}
              placeholder="CVC"
              keyboardType="number-pad"
              value={cardDetails.security_code}
              onChangeText={(text) => setCardDetails({ ...cardDetails, security_code: text })}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nome do Titular"
            value={cardDetails.cardholder_name}
            onChangeText={(text) => setCardDetails({ ...cardDetails, cardholder_name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cardDetails.cardholder_cpf}
            onChangeText={(text) => setCardDetails({ ...cardDetails, cardholder_cpf: text })}
          />
        </View>

        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Pagar Agora</Text>}
        </TouchableOpacity>
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
              <Modal
              visible={showSuccessModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSuccessModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.successModal}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="white" />
                  <Text style={styles.modalTitle}>Sucesso</Text>
                  <Text style={styles.modalMessage}>{successMessage}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowSuccessModal(false);
                      
                    }}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    backgroundColor: '#126046',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  cardVisual: {
    backgroundColor: '#126046',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    color: '#D1FAE5',
    fontSize: 14,
  },
  cardForm: {
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  paymentButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#126046',
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
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
  },
  successModal: {
    backgroundColor: 'green',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default Cartao;
