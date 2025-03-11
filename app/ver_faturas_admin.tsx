import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllFaturas, updateStatusFatura } from '@/lib/appwrite';

const meses = {
    janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
};

const VerFaturasAdmin = () => {
  const { atletaId, atletaNome } = useLocalSearchParams();
  const [faturas, setFaturas] = useState([]);

  useEffect(() => {
    const fetchFaturas = async () => {
      try {
        const todasFaturas = await getAllFaturas();
        const faturasFiltradas = todasFaturas.filter((fatura) => fatura.atletaId === atletaId);
        setFaturas(faturasFiltradas);
      } catch (error) {
        console.error('Erro ao carregar faturas:', error.message);
      }
    };

    fetchFaturas();
  }, [atletaId]);

  const handleAprovarPagamento = async (docId, status_pagamento) => {
    if (status_pagamento.includes("Pendente em Dinheiro")) {
        const novoStatus = status_pagamento.replace("Pendente em Dinheiro", "Pago em Dinheiro");
        
        try {
            await updateStatusFatura(docId, novoStatus);
            Alert.alert("Sucesso", "Pagamento aprovado com sucesso!");
            
            // Atualizar o estado das faturas
            setFaturas((prevFaturas) =>
                prevFaturas.map((fatura) =>
                    fatura.$id === docId ? { ...fatura, status_pagamento: novoStatus } : fatura
                )
            );
        } catch (error) {
            console.error("Erro ao aprovar pagamento:", error.message);
            Alert.alert("Erro", "Não foi possível aprovar o pagamento.");
        }
    }
};


  const renderFaturaItem = ({ item }) => {
    let cardColor = '#FFFFFF'; // Cor padrão
    let statusMessage = null;
    const podeAprovar = item.status_pagamento?.includes("Pendente em Dinheiro");


    // Pegamos a data de hoje
    const hoje = new Date();
    const [mesTexto, anoTexto] = item.mes_cobranca.split('/');
    const mes = meses[mesTexto.toLowerCase()];
    const ano = parseInt(`20${anoTexto}`, 10);
    const dataCobranca = new Date(ano, mes, item.dia_cobranca);

    // Define cores do card conforme status
    if (item.status_pagamento?.includes('Pendente')) {
      cardColor = '#FAD02E'; // Amarelo para pendente
      statusMessage = 'Esperando Aprovação';
    } else if (item.status_pagamento?.includes('Pago')) {
      cardColor = '#34A853'; // Verde para pago
      statusMessage = 'Pagamento realizado com sucesso!';
    } else if (!item.status_pagamento && dataCobranca < hoje) {
      cardColor = '#FFCC80'; // Laranja claro para fatura vencida
      statusMessage = 'Fatura Vencida';
    }

    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Plano: {item.plano}</Text>
          <Text style={styles.cardText}>Mês Cobrança: {item.mes_cobranca.charAt(0).toUpperCase() + item.mes_cobranca.slice(1)}</Text>
          <Text style={styles.cardText}>Dia Cobrança: {item.dia_cobranca}</Text>
        </View>

        {statusMessage && <Text style={styles.statusMessage}>{statusMessage}</Text>}

        {podeAprovar && (
            <TouchableOpacity style={styles.aprovarButton} onPress={() => handleAprovarPagamento(item.$id, item.status_pagamento)}>
                <Text style={styles.aprovarButtonText}>Aprovar Pagamento</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faturas do Atleta: {atletaNome}</Text>
      </View>

      <FlatList
        data={faturas}
        renderItem={renderFaturaItem}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="file-text-o" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma fatura encontrada</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default VerFaturasAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  aprovarButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#126046',
    alignItems: 'center',
  },
  aprovarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statusMessage: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
});
