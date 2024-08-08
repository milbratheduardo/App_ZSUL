import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const TurmasCard = ({ turma: { title, Qtd_Semana, Dia1, Dia2, Dia3, Local, MaxAlunos }, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      className="flex-col items-start p-4 mb-4 bg-gray-800 rounded-lg shadow-md pb-6"
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
            Vagas Disponíveis: {MaxAlunos}
        </Text>
        <Text className="text-white text-sm mt-2">
            Local: {Local}
        </Text>
    </TouchableOpacity>
  )
}

export default TurmasCard;
