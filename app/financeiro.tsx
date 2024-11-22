import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { router } from 'expo-router';


const Financeiro = () => {
  const [payments, setPayments] = useState([]); // Armazena os pagamentos
  const [contracts, setContracts] = useState([]); // Armazena os contratos
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para buscar pagamentos e contratos da API
    const fetchFinancialData = async () => {
      try {
        const paymentData = await getPayments(); // Chama a API para obter pagamentos
        const contractData = await getContracts(); // Chama a API para obter contratos

        setPayments(paymentData);
        setContracts(contractData);
      } catch (error) {
        console.error('Erro ao buscar dados financeiros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Renderiza cada pagamento
  const renderPayment = ({ item }: { item: { id: string; name: string; amount: number; date: string } }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSubtitle}>Valor: R$ {item.amount.toFixed(2)}</Text>
      <Text style={styles.itemSubtitle}>Data: {item.date}</Text>
    </View>
  );

  // Renderiza cada contrato
  const renderContract = ({ item }: { item: { id: string; name: string; type: string } }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSubtitle}>Modelo de Contrato: {item.type}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Financeiro</Text>

      {isLoading ? (
        <Text style={styles.loadingText}>Carregando dados financeiros...</Text>
      ) : (
        <>
          {/* Lista de Pagamentos */}
          <Text style={styles.sectionHeader}>Pagamentos</Text>
          <FlatList
            data={payments}
            renderItem={renderPayment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>Nenhum pagamento encontrado.</Text>
            )}
          />

          {/* Lista de Contratos */}
          <Text style={styles.sectionHeader}>Contratos</Text>
          <FlatList
            data={contracts}
            renderItem={renderContract}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>Nenhum contrato encontrado.</Text>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default Financeiro;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemCard: {
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
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
