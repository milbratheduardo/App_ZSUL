import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import CustomButton from './CustomButton'; // Botão reutilizável
import { getImageUrl, getCurrentUser, updateEventConfirmados } from '@/lib/appwrite';
import { router } from 'expo-router'; // Importe o router do expo-router

const EventCard = ({ event }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(''); // Adicionei para armazenar o papel do usuário

  useEffect(() => {
    // Buscar imagem do evento
    const fetchImageUrl = async () => {
      if (event.ImageID) {
        try {
          const url = await getImageUrl(event.ImageID);
          setImageUrl(url);
        } catch (error) {
          console.error("Erro ao buscar a URL da imagem:", error);
        }
      }
    };

    fetchImageUrl();

    // Buscar usuário atual
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser(); // Supondo que getCurrentUser retorne o ID do usuário
        setUserId(currentUser.$id);
        setUserRole(currentUser.role); // Adicionando o papel do usuário
        checkIfConfirmed(currentUser.$id);
      } catch (error) {
        console.error("Erro ao buscar o usuário atual:", error);
      }
    };

    fetchUser();
  }, [event.Confirmados]);

  // Verifica se o usuário já confirmou a presença
  const checkIfConfirmed = (userId) => {
    if (event.Confirmados && event.Confirmados.includes(userId)) {
      setIsConfirmed(true); // Usuário já confirmado
    }
  };

  // Função para confirmar presença
  const handleConfirmPresence = async () => {
    if (userId && !isConfirmed) {
      try {
        const updatedConfirmados = [...event.Confirmados, userId]; // Adiciona o ID do usuário à lista
        await updateEventConfirmados(event.$id, updatedConfirmados); // Função para atualizar o evento no banco de dados

        setIsConfirmed(true); // Atualiza o estado local
        Alert.alert('Sucesso', 'Você confirmou presença no evento');
      } catch (error) {
        console.error("Erro ao confirmar presença:", error);
        Alert.alert('Erro', 'Não foi possível confirmar a presença');
      }
    }
  };

  // Função para cancelar presença
  const handleCancelPresence = async () => {
    if (userId && isConfirmed) {
      try {
        const updatedConfirmados = event.Confirmados.filter((id) => id !== userId); // Remove o ID do usuário da lista
        await updateEventConfirmados(event.$id, updatedConfirmados); // Atualiza o evento no banco de dados

        setIsConfirmed(false); // Atualiza o estado local
        Alert.alert('Sucesso', 'Você cancelou sua presença no evento');
      } catch (error) {
        console.error("Erro ao cancelar presença:", error);
        Alert.alert('Erro', 'Não foi possível cancelar a presença');
      }
    }
  };

  const handleViewRelated = () => {
    // Navega para a tela 'ver_relacionados' e passa os IDs de confirmados
    router.push({
      pathname: '/ver_relacionados', // Nome da rota para a tela 'Ver Relacionados'
      params: {
        confirmados: event.Confirmados.join(','), // Passa os IDs como uma string separada por vírgula
        eventTitle: event.Title, // Passando também o título do evento se necessário
        eventId: event.$id
      }
    });
  };

  // Função para ver confirmados (para o admin)
  const handleViewConfirmados = () => {
    // Lógica para ver confirmados (pode ser similar ao handleViewRelated)
    router.push({
      pathname: '/ver_confirmados', // Nome da rota para a tela 'Ver Confirmados'
      params: {
        confirmados: event.Confirmados.join(','), // Passa os IDs como uma string separada por vírgula
        eventTitle: event.Title, // Passando também o título do evento
        eventId: event.$id
      }
    });
  };

  return (
    <View style={{ marginBottom: 16, borderRadius: 8, backgroundColor: '#fff', padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
      {/* Imagem do evento */}
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8 }} 
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 10 }}>Evento sem capa</Text>
      )}

      {/* Título do evento */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{event.Title}</Text>

      {/* Descrição do evento */}
      <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>{event.Description}</Text>

      {/* Data e hora do evento */}
      <Text style={{ fontSize: 14, color: '#777' }}>
        Data: {event.Date_event} - Hora: {event.Hora_event}
      </Text>

      {/* Botões diferentes dependendo do tipo de evento */}
      {event.Type === 'partida' ? (
        <CustomButton
          title="Ver Relacionados"
          handlePress={handleViewRelated}
          containerStyles="mt-4 p-3 bg-primary"
        />
      ) : isConfirmed ? (
        <>
          <Text style={{ fontSize: 14, color: 'green', marginTop: 10 }}>Você já está inscrito neste evento</Text>
          <CustomButton
            title="Cancelar Presença"
            handlePress={handleCancelPresence}
            containerStyles="mt-4 p-3 bg-red-500"
          />
        </>
      ) : (
        <CustomButton
          title="Confirmar Presença"
          handlePress={handleConfirmPresence}
          containerStyles="mt-4 p-3 bg-golden"
        />
      )}

      {/* Botão adicional para admin */}
      {userRole === 'admin' && event.Type === 'evento' && (
        <CustomButton
          title="Ver Confirmados"
          handlePress={handleViewConfirmados}
          containerStyles="mt-4 p-3 bg-golden"
        />
      )}
    </View>
  );
};

export default EventCard;
