import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllAlunos, getAllFaturas } from '@/lib/appwrite';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const PlanosAtletas = () => {
  const { user } = useGlobalContext();
  const [alunos, setAlunos] = useState([]);
  const [faturas, setFaturas] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allAlunos = await getAllAlunos();
        const filteredAlunos = allAlunos.filter(
          (aluno) => aluno.nomeResponsavel === user.cpf
        );

        const faturasMap = {};
        for (const aluno of filteredAlunos) {
          const fatura = await getFaturaMaisRecente(aluno.userId);
          faturasMap[aluno.userId] = fatura;
        }

        setAlunos(filteredAlunos);
        setFaturas(faturasMap);
      } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
      }
    };

    fetchData();
  }, [user.cpf]);

  const getFaturaMaisRecente = async (alunoId) => {
    try {
      const todasFaturas = await getAllFaturas();
      const faturasFiltradas = todasFaturas.filter(
        (fatura) => fatura.atletaId === alunoId
      );

      if (faturasFiltradas.length === 0) return null;

      const faturaMaisRecente = faturasFiltradas.reduce((prev, curr) =>
        prev.$createdAt > curr.$createdAt ? prev : curr
      );

      const diaCobranca = faturaMaisRecente.dia_cobranca;
      const mesAnoCobranca = faturaMaisRecente.mes_cobranca; // Exemplo: "março/25"

      // Converte a string "março/25" para uma data válida
      const mesAnoFormatado = moment(mesAnoCobranca, 'MMMM/YY').format('YYYY-MM');
      const dataCobrancaFinal = moment(`${mesAnoFormatado}-${diaCobranca}`, 'YYYY-MM-DD');

      // Se a data da última fatura já passou, redefinir como nulo para permitir escolher novo plano
      const hoje = moment();
      const vencida = hoje.isAfter(dataCobrancaFinal);

      return vencida
        ? { plano: null, dia_cobranca: null, faturaId: faturaMaisRecente.$id }
        : {
            plano: faturaMaisRecente.plano || 'N/A',
            dia_cobranca: faturaMaisRecente.dia_cobranca || 'N/A',
            faturaId: faturaMaisRecente.$id,
          };
    } catch (error) {
      console.error('Erro ao buscar fatura mais recente:', error.message);
      return null;
    }
  };

  const renderAlunoItem = ({ item }) => {
    const fatura = faturas[item.userId] || {};

    return (
      <View style={styles.listItem}>
        <View style={styles.headerInfo}>
          <Image source={{ uri: item.avatarUrl || 'https://example.com/default-avatar.png' }} style={styles.avatar} />
          <View>
            <Text style={styles.alunoName}>{item.nome}</Text>
            <Text style={styles.alunoTurma}>Plano: {fatura.plano || 'Não Escolhido'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="file-document" size={30} color="#126046" />
            <Text style={styles.statText}>Plano Escolhido</Text>
            <Text style={styles.statValue}>{fatura.plano || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar" size={30} color="#126046" />
            <Text style={styles.statText}>Data de Cobrança</Text>
            <Text style={styles.statValue}>{fatura.dia_cobranca || 'N/A'}</Text>
          </View>
        </View>

        {!fatura.plano || fatura.plano === null ? (
            <>
                <TouchableOpacity
                style={styles.planoButton}
                onPress={() =>
                    router.push({
                    pathname: '/escolher_plano',
                    params: { alunoId: item.userId, responsavelId: user.userId, alunoNome: item.nome }
                    })
                }
                >
                <Text style={styles.planoButtonText}>Escolher Plano</Text>
                </TouchableOpacity>

                {fatura.faturaId && (
                <TouchableOpacity
                    style={styles.faturaButton}
                    onPress={() =>
                    router.push({ pathname: '/ver_faturas', params: { alunoId: item.userId, alunoNome: item.nome } })
                    }
                >
                    <Text style={styles.faturaButtonText}>Ver Faturas</Text>
                </TouchableOpacity>
                )}
            </>
            ) : (
            <TouchableOpacity
                style={styles.faturaButton}
                onPress={() => router.push({ pathname: '/ver_faturas', params: { alunoId: item.userId, alunoNome: item.nome } })}
            >
                <Text style={styles.faturaButtonText}>Ver Faturas</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planos dos Atletas</Text>
        <Text style={styles.headerSubtitle}>Gerencie os planos dos alunos</Text>
      </View>

      <FlatList
        data={alunos}
        renderItem={renderAlunoItem}
        keyExtractor={(item) => `${item.$id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="user" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhum atleta encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default PlanosAtletas;

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
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  alunoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  alunoTurma: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  planoButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#126046',
    alignItems: 'center',
  },
  planoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  faturaButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF6600',
    alignItems: 'center',
  },
  faturaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
