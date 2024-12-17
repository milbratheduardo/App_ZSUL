import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

const Pagamentos2 = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [loading, setLoading] = useState(false);
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
        Alert.alert('Erro', 'Falha ao buscar os dados dos alunos.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [user.cpf]);

  const handleContinue = () => {
    if (!selectedPlan || !selectedAluno) {
      Alert.alert('Erro', 'Selecione um plano e um aluno.');
      return;
    }

    // Redirecionar para a tela /cartao com os parâmetros
    router.push({
      pathname: '/cartao',
      params: {
        plan_id: selectedPlan,
        userId: user.userId,
        atletaId: selectedAluno.userId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selecione um Plano e um Aluno</Text>
        </View>

        {/* Carrossel de Planos */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {planos.map((plano) => (
            <TouchableOpacity
              key={plano.id}
              style={[styles.planCard, selectedPlan === plano.id && styles.selected]}
              onPress={() => setSelectedPlan(plano.id)}
            >
              <Text style={styles.planTitle}>{plano.title}</Text>
              <Text style={styles.planPrice}>R$ {plano.price},00</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de Alunos */}
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

        {/* Botão para Continuar */}
        <TouchableOpacity style={styles.paymentButton} onPress={handleContinue}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.paymentButtonText}>Continuar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Pagamentos2;

// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 30,
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
  carousel: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  planCard: {
    width: 120,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    elevation: 3,
  },
  selected: {
    borderColor: '#126046',
    borderWidth: 2,
  },
  alunoList: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alunoCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    elevation: 3,
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
});
