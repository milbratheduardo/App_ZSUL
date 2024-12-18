import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllAlunos } from '@/lib/appwrite';
import { format } from 'date-fns'; // Biblioteca para formatação de datas

const Financeiro = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinanceiro = async () => {
      try {
        setLoading(true);

        const allAlunos = await getAllAlunos();

        const alunosComFaturas = allAlunos.map((aluno) => {
          let plano;
          switch (aluno.status_pagamento) {
            case '2c93808493b072d80193be79bea105ac':
              plano = 'Plano Semestral';
              break;
            case '2c93808493b072d70193be7c14b30582':
              plano = 'Plano Mensal';
              break;
            case '2c93808493b073170193be7a300c053f':
              plano = 'Plano Anual';
              break;
            default:
              plano = aluno.status_pagamento;
          }

          // Formatar o campo `end_date`
          const formattedEndDate = aluno.end_date
            ? format(new Date(aluno.end_date), 'dd/MM/yyyy')
            : 'N/A';

          return {
            ...aluno,
            plano,
            formattedEndDate,
          };
        });

        setAlunos(alunosComFaturas);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceiro();
  }, []);

  const renderAlunoItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.alunoName}>{item.nome}</Text>
      <Text style={styles.info}>Plano: {item.plano}</Text>
      <Text style={styles.info}>ID Transação: {item.id_transacao || 'N/A'}</Text>
      <Text style={styles.info}>End Date: {item.formattedEndDate}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financeiro</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#126046" />
      ) : (
        <FlatList
          data={alunos}
          renderItem={renderAlunoItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum dado financeiro encontrado.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Financeiro;

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
