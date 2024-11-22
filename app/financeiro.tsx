import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Financeiro = () => {
  const [billingData, setBillingData] = useState([]); // Lista de dados de faturamento
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para buscar dados de faturamento
    const fetchBillingData = async () => {
      try {
        const response = await fetch(
          'https://de48-2804-d51-a416-500-e807-6da6-797b-90de.ngrok-free.app/billing'
        );
        const data = await response.json();

        if (response.ok) {
          setBillingData(data.billing || []); // Define os dados de faturamento se existirem
        } else {
          console.error('Erro ao buscar dados de faturamento:', data.message);
        }
      } catch (error) {
        console.error('Erro ao buscar dados financeiros:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Renderiza cada item de faturamento
  const renderBillingItem = ({ item }) => {
    const statusStyle =
      item.status === 'paid'
        ? styles.statusPaid
        : item.status === 'open'
        ? styles.statusPending
        : styles.statusDefault;

    const statusText =
      item.status === 'paid' ? 'PAGO' : item.status === 'open' ? 'PENDENTE' : item.status;

    return (
      <View style={styles.itemCard}>
        <Text style={styles.itemTitle}>{item.client}</Text>
        <Text style={[styles.itemSubtitle, statusStyle]}>Status: {statusText}</Text>
        <Text style={styles.itemSubtitle}>Valor: R$ {item.amount?.toFixed(2)}</Text>
        <Text style={styles.itemSubtitle}>Data de Vencimento: {item.due_date}</Text>
        {item.metadata && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataHeader}>Metadados:</Text>
            {Object.entries(item.metadata).map(([key, value]) => (
              <Text key={key} style={styles.metadataItem}>
                {key}: {value}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Financeiro</Text>

      {isLoading ? (
        <Text style={styles.loadingText}>Carregando dados financeiros...</Text>
      ) : (
        <FlatList
          data={billingData}
          renderItem={renderBillingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Nenhum dado de faturamento encontrado.</Text>
          )}
        />
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
  statusPaid: {
    backgroundColor: '#DFF6DD',
    color: '#126046',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: '#FFF6DD',
    color: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusDefault: {
    backgroundColor: '#F4F4F4',
    color: '#888',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metadataContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  metadataHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  metadataItem: {
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
