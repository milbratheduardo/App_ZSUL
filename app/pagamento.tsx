import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchPaymentDetails, fetchContractDetails } from '@/lib/appwrite'; // Funções para buscar dados de pagamento e contrato
import { useGlobalContext } from '@/context/GlobalProvider';

const Payment = () => {
  const { user } = useGlobalContext();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [contractDetails, setContractDetails] = useState(null);
  const [selectedOption, setSelectedOption] = useState('faturas'); // 'faturas' ou 'modalidade'

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await fetchPaymentDetails(user.userId);
        setPaymentDetails(details);
      } catch (error) {
        console.error('Erro ao buscar detalhes de pagamento:', error);
      }
    };

    const loadContractDetails = async () => {
      try {
        const contract = await fetchContractDetails(user.userId);
        setContractDetails(contract);
      } catch (error) {
        console.error('Erro ao buscar detalhes do contrato:', error);
      }
    };

    loadDetails();
    loadContractDetails();
  }, [user.userId]);

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentItem}>
      <Text style={styles.paymentTitle}>Fatura {item.month}/{item.year}</Text>
      <Text style={styles.paymentStatus}>
        Status: <Text style={{ fontWeight: 'bold', color: item.status === 'Pago' ? '#28a745' : '#dc3545' }}>{item.status}</Text>
      </Text>
      <Text style={styles.paymentAmount}>Valor: R$ {item.amount}</Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pagamentos e Contrato</Text>
        <Text style={styles.headerSubtitle}>Gerencie suas faturas e modalidade de contrato</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionButton, selectedOption === 'faturas' && styles.optionButtonSelected]}
          onPress={() => setSelectedOption('faturas')}
        >
          <Text style={[styles.optionButtonText, selectedOption === 'faturas' && styles.optionButtonTextSelected]}>
            Faturas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, selectedOption === 'modalidade' && styles.optionButtonSelected]}
          onPress={() => setSelectedOption('modalidade')}
        >
          <Text style={[styles.optionButtonText, selectedOption === 'modalidade' && styles.optionButtonTextSelected]}>
            Modalidade do Contrato
          </Text>
        </TouchableOpacity>
      </View>

      {selectedOption === 'faturas' ? (
        <FlatList
          data={paymentDetails}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="credit-card" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>Nenhuma fatura encontrada</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.contractContainer}>
          {contractDetails ? (
            <>
              <Text style={styles.contractTitle}>Modalidade do Contrato</Text>
              <Text style={styles.contractText}>Tipo: {contractDetails.type}</Text>
              <Text style={styles.contractText}>Valor Mensal: R$ {contractDetails.monthlyAmount}</Text>
              <Text style={styles.contractText}>Duração: {contractDetails.duration} meses</Text>
              <Text style={styles.contractText}>Início: {contractDetails.startDate}</Text>
              <Text style={styles.contractText}>Fim: {contractDetails.endDate}</Text>
            </>
          ) : (
            <Text style={styles.emptyStateText}>Nenhuma modalidade de contrato disponível</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#126046',
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  optionButtonSelected: {
    backgroundColor: '#126046',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  paymentItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  detailsButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#126046',
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  contractContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contractText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
});
