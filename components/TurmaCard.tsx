import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importando FontAwesome
import { getAlunosByTurmaId } from '@/lib/appwrite'; // Supondo que você já tenha configurado isso

const TurmasCard = ({ turma: { turmaId, title, Horario_de_inicio, Local, Dia1, Dia2, Dia3, Horario_de_termino, MaxAlunos }, onPress }) => {
  const [vagasDisponiveis, setVagasDisponiveis] = useState(MaxAlunos);
  const [expanded, setExpanded] = useState(false); // Para controlar a expansão do card

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunos = await getAlunosByTurmaId(turmaId);
        setVagasDisponiveis(alunos.length);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    };

    fetchAlunos();
  }, [turmaId, MaxAlunos]);

  // Alterna a expansão do card ao clicar
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleEdit = () => {
    // Aqui você pode colocar a lógica para a ação de edição
    console.log("Editar turma:", turmaId);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={styles.cardContainer}
      onPress={toggleExpand} // Alterna a expansão
    >
      <View style={styles.backgroundShape}></View>
      <View style={styles.contentContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>
          {title}
        </Text>
        <Icon name="futbol-o" size={22} color="#fff" style={styles.footballIcon} />  
      </View>
        <View style={styles.detailsRow}>
          <Text style={styles.info}>
            Horário: {Horario_de_inicio} - {Horario_de_termino}
          </Text>
          

          <View style={styles.iconsContainer}>
            {/* Ícone de futebol acima do ícone de vagas */}
            <View style={styles.vagasContainer}>
              <Icon name="users" size={18} color="#fff" />
              <Text style={styles.vagasCount}>{vagasDisponiveis}</Text>
            </View>
          </View>
        </View>

        {/* Informações adicionais que aparecem somente ao expandir */}
        {expanded && (
          <View style={styles.expandedInfo}>
            {/* Adicione aqui informações adicionais como dias e local */}
            <Text style={styles.additionalInfo}>Dias: {Dia1} | {Dia2} | {Dia3}</Text>
            <Text style={styles.additionalInfo}>Local: {Local}</Text>

            {/* Ícone de edição */}
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Icon name="sign-in" size={20} color="#1E3A8A" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#003300', // Fundo verde escuro
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    maxWidth: 350,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative', // Para o backgroundShape
    overflow: 'hidden',
  },
  backgroundShape: {
    position: 'absolute',
    bottom: 0,
    right: 70,
    height: '90%',
    width: '100%',
    backgroundColor: '#005500', // Cor verde claro da forma no fundo
    borderTopRightRadius: 50, // Arredondamento similar ao formato
    zIndex: -1, // Para ficar atrás do conteúdo
  },
  contentContainer: {
    flexDirection: 'column',
    zIndex: 1, // Para garantir que o conteúdo fique na frente da forma
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -8,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    color: '#d3d3d3',
    fontSize: 14,
  },
  iconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  footballIcon: {
    marginBottom: 10, // Margem entre o ícone de futebol e o ícone de vagas
  },
  vagasContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  vagasCount: {
    color: '#ffcc00', // Cor amarela para destacar as vagas
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  expandedInfo: {
    marginTop: 10,
  },
  additionalInfo: {
    color: '#d3d3d3',
    fontSize: 12,
    marginTop: 5,
  },
  editButton: {
    marginTop: 10, // Espaço para o botão de editar
    alignSelf: 'flex-end', // Alinha o ícone no final
    backgroundColor: '#fff', // Cor de fundo do botão de editar
    padding: 10,
    borderRadius: 50,
  },
});

export default TurmasCard;
