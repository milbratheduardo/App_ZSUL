import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAlunosByTurmaId } from '@/lib/appwrite';

const TurmasCard = ({ turma: { turmaId, title, Qtd_Semana, Dia1, Dia2, Dia3, Local, MaxAlunos, Horario_de_inicio, Horario_de_termino }, onPress }) => {
  const [vagasDisponiveis, setVagasDisponiveis] = useState(MaxAlunos);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunos = await getAlunosByTurmaId(turmaId);
        setVagasDisponiveis(MaxAlunos - alunos.length);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    };

    fetchAlunos();
  }, [turmaId, MaxAlunos]);


  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      className="flex-col items-start p-4 mb-6 bg-gray-800 rounded-lg shadow-md pb-6"
      onPress={onPress}
      style={{
        width: '90%', // Define a largura dos cards como 90% da largura da tela
        maxWidth: 350, // Define uma largura máxima para os cards
        alignSelf: 'center', // Centraliza os cards horizontalmente
      }}
    >
        <Text className="text-white font-semibold text-lg mb-2">
            {title}
        </Text>
        <Text className="text-white text-sm mb-1">
            {Qtd_Semana} vez(es) na semana
        </Text>
        <Text className="text-white text-sm mb-1">
            Dias:
        </Text>
        {Dia1 && (
          <Text className="text-white text-sm ml-2">
              {Dia1}
          </Text>
        )}
        {Dia2 && (
          <Text className="text-white text-sm ml-2">
              {Dia2}
          </Text>
        )}
        {Dia3 && (
          <Text className="text-white text-sm ml-2">
              {Dia3}
          </Text>
        )}
        <Text className="text-white text-sm mt-2">
            Horário de Início: {Horario_de_inicio}
        </Text>
        <Text className="text-white text-sm mt-2">
            Horário do Término: {Horario_de_termino}
        </Text>
        <Text className="text-white text-sm mt-2">
            Vagas Disponíveis: {vagasDisponiveis}
        </Text>
        <Text className="text-white text-sm mt-2">
            Local: {Local}
        </Text>
    </TouchableOpacity>
  );
};

export default TurmasCard;
