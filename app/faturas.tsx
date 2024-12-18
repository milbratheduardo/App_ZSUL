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
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos } from '@/lib/appwrite';
import { format } from 'date-fns'; // Biblioteca para formatar datas

const Faturas = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFaturas = async () => {
      try {
        setLoading(true);

        const allAlunos = await getAllAlunos();
        const responsavelAlunos = allAlunos.filter(
          (aluno) => aluno.nomeResponsavel === user.cpf
        );

        const alunosComFaturas = responsavelAlunos.map((aluno) => {
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
        Alert.alert('Erro', 'Não foi possível carregar as faturas.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaturas();
  }, [user.cpf]);

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
        <Text style={styles.title}>Meus Pagamentos</Text>
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
              <Text style={styles.emptyText}>Nenhuma fatura encontrada.</Text>
            </View>
          }
        />
      )}
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
