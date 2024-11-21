import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllRelatorios } from '@/lib/appwrite';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';

const DashboardMetodologias = () => {
  const { user } = useGlobalContext();
  const [metodologias, setMetodologias] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [leastUsed, setLeastUsed] = useState([]);
  const firstName = user?.nome.split(' ')[0];

  useEffect(() => {
    const fetchMetodologias = async () => {
      try {
        const relatorios = await getAllRelatorios();
        const userRelatorios = relatorios.filter((relatorio) => relatorio.userId === user.userId);

        // Contar ocorrências de cada metodologia
        const metodologiaCounts = {};
        userRelatorios.forEach((relatorio) => {
          (relatorio.metodologias || []).forEach((metodologia) => {
            metodologiaCounts[metodologia] = (metodologiaCounts[metodologia] || 0) + 1;
          });
        });

        const sortedMetodologias = Object.entries(metodologiaCounts).sort((a, b) => b[1] - a[1]);
        const totalMetodologias = sortedMetodologias.length;

        if (totalMetodologias === 0) {
          setLeastUsed([]);
          setMostUsed([]);
        } else if (totalMetodologias === 1) {
          setMostUsed([sortedMetodologias[0][0]]);
          setLeastUsed([]);
        } else {
          const splitIndex = Math.ceil(totalMetodologias / 2);
          setMostUsed(sortedMetodologias.slice(0, splitIndex).map(([key]) => key));
          setLeastUsed(sortedMetodologias.slice(splitIndex).map(([key]) => key));
        }

        setMetodologias(sortedMetodologias.map(([key]) => key));
      } catch (error) {
        console.error('Erro ao buscar metodologias:', error);
      }
    };

    fetchMetodologias();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {firstName}</Text>
        <Text style={styles.subtitle}>Resumo das Metodologias Aplicadas</Text>
      </View>

      {/* Dashboard */}
      <View style={styles.dashboard}>
        <View style={styles.dashboardCard}>
          <Icon name="book" size={30} color="#126046" />
          <Text style={styles.dashboardNumber}>{metodologias.length}</Text>
          <Text style={styles.dashboardLabel}>Total de Metodologias</Text>
        </View>
      </View>

      {/* Análise das Metodologias */}
      <ScrollView contentContainerStyle={styles.metodologiasContainer}>
        <Text style={styles.sectionTitle}>Mais Aplicadas</Text>
        {mostUsed.map((metodologia, index) => (
          <View key={index} style={[styles.card, styles.mostUsedCard]}>
            <Text style={styles.cardTitle}>Metodologia {index + 1}</Text>
            <Text style={styles.cardDescription}>{metodologia}</Text>
            <AntDesign name="arrowup" size={20} color="#126046" style={styles.arrowIcon} />
          </View>
        ))}

        <Text style={styles.sectionTitle}>Menos Aplicadas</Text>
        {leastUsed.map((metodologia, index) => (
          <View key={index} style={[styles.card, styles.leastUsedCard]}>
            <Text style={styles.cardTitle}>Metodologia {index + 1}</Text>
            <Text style={styles.cardDescription}>{metodologia}</Text>
            <AntDesign name="arrowdown" size={20} color="#FF6347" style={styles.arrowIcon} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardMetodologias;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  dashboardCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#126046',
    marginVertical: 8,
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#666',
  },
  metodologiasContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    marginVertical: 10,
    paddingLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  mostUsedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#126046',
  },
  leastUsedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  arrowIcon: {
    position: 'absolute',
    top: 15,
    right: 10,
  },
});
