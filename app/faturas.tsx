import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos, getHistoricoPagamentosByResponsavel } from '@/lib/appwrite';
import { format } from 'date-fns'; // Biblioteca para formatar datas
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Faturas = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');
  const [pagamentos, setPagamentos] = useState([]);


    useEffect(() => {
      const fetchFaturas = async () => {
        try {
          setLoading(true);
          
          const historico = await getHistoricoPagamentosByResponsavel(user.cpf);
  
          const pagamentosFormatados = historico.map((pagamento) => {
            // Formatar a data de vencimento
            const formattedEndDate = pagamento.end_date
              ? format(new Date(pagamento.end_date), 'dd/MM/yyyy')
              : 'N/A';
  
            return {
              ...pagamento,
              formattedEndDate,
            };
          });
  
          setPagamentos(pagamentosFormatados);
        } catch (error) {
          setErrorMessage(`Não foi possível carregar as faturas.`);
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchFaturas();
    }, [user.cpf]);

    const renderPagamentoItem = ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.alunoName}>{item.nome}</Text>
        <Text style={styles.info}>Plano: {item.status_pagamento || 'N/A'}</Text>
        <Text style={styles.info}>ID Transação: {item.id_transacao || 'N/A'}</Text>
        <Text style={styles.info}>Data de Vencimento: {item.formattedEndDate}</Text>
      </View>
    );
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Pagamentos</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#126046" />
        ) : (
          <FlatList
            data={pagamentos}
            renderItem={renderPagamentoItem}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma fatura encontrada.</Text>
              </View>
            }
          />
        )}
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
  
  export default Faturas;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#126046' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alunoName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#888' },
});
