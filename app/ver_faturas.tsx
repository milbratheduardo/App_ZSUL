import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAllFaturas } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

const meses = {
    janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
  };

const VerFaturas = () => {
  const { alunoId, alunoNome } = useLocalSearchParams();
  const [faturas, setFaturas] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFaturas = async () => {
      try {
        const todasFaturas = await getAllFaturas();
        const faturasFiltradas = todasFaturas
          .filter((fatura) => fatura.atletaId === alunoId)

        setFaturas(faturasFiltradas);
      } catch (error) {
        console.error('Erro ao carregar faturas:', error.message);
      }
    };

    fetchFaturas();
  }, [alunoId]);

  const renderFaturaItem = ({ item }) => {
    let cardColor = '#FFFFFF'; // Cor padrão
    let statusMessage = null;
    let podePagar = false; // Controle para exibir o botão
  
    // Pegamos a data de hoje
    const hoje = new Date();
    const [mesTexto, anoTexto] = item.mes_cobranca.split('/'); // Ex: 'março/25'
    const mes = meses[mesTexto.toLowerCase()];
    const ano = parseInt(`20${anoTexto}`, 10);
    const dataCobranca = new Date(ano, mes, item.dia_cobranca);
  
    // Se o pagamento ainda não foi registrado
    if (!item.status_pagamento) {
      podePagar = true;
      
      // Verifica se a fatura está vencida e não paga
      if (dataCobranca < hoje) {
        cardColor = '#FFCC80'; // Laranja claro
        statusMessage = 'Fatura Vencida';
      }
    } else {
      // Se a fatura tem um status de pagamento, aplicamos as regras normais
      if (item.status_pagamento.includes('Pendente')) {
        cardColor = '#FAD02E'; // Amarelo
        statusMessage = 'Esperando Aprovação';
      } else {
        cardColor = '#34A853'; // Verde
        statusMessage = 'Pagamento realizado com sucesso!';
      }
    }
  
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Plano: {item.plano}</Text>
          <Text style={styles.cardText}>Mês Cobrança: {item.mes_cobranca.charAt(0).toUpperCase() + item.mes_cobranca.slice(1)}</Text>
          <Text style={styles.cardText}>Dia Cobrança: {item.dia_cobranca}</Text>
        </View>
  
        {statusMessage && <Text style={styles.statusMessage}>{statusMessage}</Text>}
  
        {podePagar && (
          <TouchableOpacity
            style={styles.pagarButton}
            onPress={() =>
              router.push({
                pathname: '/pagamento3',
                params: {
                  responsavelId: item.responsavelId,
                  atletaId: item.atletaId,
                  plano: item.plano,
                  planoId: item.planoId,
                  docId: item.$id
                },
              })
            }
          >
            <Text style={styles.pagarButtonText}>Pagar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faturas</Text>
        <Text style={styles.headerSubtitle}>{alunoNome}</Text>
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

export default VerFaturas;

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
  headerSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
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
  pagarButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF6600',
    alignItems: 'center',
  },
  pagarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statusMessage: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
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
