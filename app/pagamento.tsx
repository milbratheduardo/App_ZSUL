import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos } from '@/lib/appwrite';

const Pagamentos = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [loading, setLoading] = useState(true);

  const planos = [
    { id: 'mensal', title: 'Mensal', price: 45 }, // Valor em reais
    { id: 'semestral', title: 'Semestral', price: 50 },
    { id: 'anual', title: 'Anual', price: 60 },
  ];

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setLoading(true);
        const allAlunos = await getAllAlunos();
        const alunosFiltrados = allAlunos.filter((aluno) => aluno.nomeResponsavel === user.cpf);
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

  const handlePayment = async () => {
    if (!selectedPlan || !selectedAluno) {
      Alert.alert('Erro', 'Você deve selecionar um plano e um aluno.');
      return;
    }
  
    try {
      const response = await fetch('https://de48-2804-d51-a416-500-e807-6da6-797b-90de.ngrok-free.app/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.userId, // Passa o ID do usuário responsável como nome
          alunoId: selectedAluno.userId, // Metadata personalizada
          plano: selectedPlan, // O plano selecionado (mensal, semestral, anual)
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao iniciar o pagamento');
      }
  
      const data = await response.json();
      if (data.url) {
        // Redireciona para a URL do Stripe Checkout usando Linking
        console.log('Redirecting to Stripe Checkout URL:', data.url);
        Alert.alert('Redirecionando...', 'Você será levado ao Stripe Checkout.');
        Linking.openURL(data.url); // Abre a URL no navegador padrão do dispositivo
      } else {
        Alert.alert('Erro', 'Não foi possível iniciar o pagamento.');
      }
    } catch (error) {
      console.error('Erro ao iniciar o pagamento:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o pagamento.');
    }
  };
 
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selecione um Plano e um Aluno</Text>
          <Text style={styles.headerSubtitle}>Informações sobre as mensalidades</Text>
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

        {/* Botão para Stripe */}
        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
          <Text style={styles.paymentButtonText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Pagamentos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 30, // Espaçamento extra no final
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  carousel: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  planCard: {
    width: 100,
    height: 130,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selected: {
    borderColor: '#126046',
    borderWidth: 2,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#126046',
  },
  alunoList: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  alunoCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alunoName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
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
  emptyState: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
