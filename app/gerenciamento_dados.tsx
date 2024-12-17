import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getAllUsers, getEventsForCurrentMonth, getAllEvents } from '@/lib/appwrite';

const GerenciamentoDados = () => {
  const [atletas, setAtletas] = useState({ total: 0, mes: 0, arquivados: 0 });
  const [profissionais, setProfissionais] = useState({ total: 0, mes: 0, arquivados: 0 });
  const [responsaveis, setResponsaveis] = useState({ total: 0, mes: 0, arquivados: 0 });
  const [eventos, setEventos] = useState({ total: 0, mes: 0, realizados: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulando as chamadas de API para obter os dados
        const allUsers = await getAllUsers();
        const allEvents = await getAllEvents();
        const eventosDoMes = await getEventsForCurrentMonth();

        const atletasTotal = allUsers.filter((user) => user.role === 'atleta').length;
        const atletasArquivados = allUsers.filter((user) => user.role === 'atleta' && user.status === 'Arquivado').length;

        const profissionaisTotal = allUsers.filter((user) => user.role === 'profissional').length;
        const profissionaisArquivados = allUsers.filter((user) => user.role === 'profissional' && user.status === 'Arquivado').length;

        const responsaveisTotal = allUsers.filter((user) => user.role === 'responsavel').length;
        const responsaveisArquivados = allUsers.filter((user) => user.role === 'responsavel' && user.status === 'Arquivado').length;

        const eventosRealizados = allEvents.filter((event) => new Date(event.Date_event) < new Date()).length;

        setAtletas({
          total: atletasTotal,
          mes: atletasTotal - atletasArquivados, // Supondo que arquivados não são do mês
          arquivados: atletasArquivados,
        });

        setProfissionais({
          total: profissionaisTotal,
          mes: profissionaisTotal - profissionaisArquivados,
          arquivados: profissionaisArquivados,
        });

        setResponsaveis({
          total: responsaveisTotal,
          mes: responsaveisTotal - responsaveisArquivados,
          arquivados: responsaveisArquivados,
        });

        setEventos({
          total: allEvents.length,
          mes: eventosDoMes,
          realizados: eventosRealizados,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
      }
    };

    fetchData();
  }, []);

  const renderCard = (title, data) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardContent}>
        <View style={styles.cardItem}>
          <Icon name="users" size={20} color="#126046" />
          <Text style={styles.cardLabel}>Total</Text>
          <Text style={styles.cardValue}>{data.total}</Text>
        </View>
        <View style={styles.cardItem}>
          <Icon name="calendar" size={20} color="#126046" />
          <Text style={styles.cardLabel}>Do Mês</Text>
          <Text style={styles.cardValue}>{data.mes}</Text>
        </View>
        <View style={styles.cardItem}>
          <Icon name="archive" size={20} color="#E53935" />
          <Text style={styles.cardLabel}>Arquivados</Text>
          <Text style={styles.cardValue}>{data.arquivados}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Gerenciamento de Dados</Text>
        {renderCard('Atletas', atletas)}
        {renderCard('Profissionais', profissionais)}
        {renderCard('Responsáveis', responsaveis)}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Eventos</Text>
          <View style={styles.cardContent}>
            <View style={styles.cardItem}>
              <Icon name="trophy" size={20} color="#126046" />
              <Text style={styles.cardLabel}>Total</Text>
              <Text style={styles.cardValue}>{eventos.total}</Text>
            </View>
            <View style={styles.cardItem}>
              <Icon name="calendar" size={20} color="#126046" />
              <Text style={styles.cardLabel}>Do Mês</Text>
              <Text style={styles.cardValue}>{eventos.mes}</Text>
            </View>
            <View style={styles.cardItem}>
              <Icon name="check" size={20} color="#126046" />
              <Text style={styles.cardLabel}>Realizados</Text>
              <Text style={styles.cardValue}>{eventos.realizados}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GerenciamentoDados;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardItem: {
    alignItems: 'center',
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#126046',
    marginTop: 4,
  },
});
