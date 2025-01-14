import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import CustomButton from './CustomButton'; // Botão reutilizável
import { getImageUrl, getCurrentUser, updateEventConfirmados, getEventsConfirmados } from '@/lib/appwrite';
import { router } from 'expo-router'; // Importe o router do expo-router
import { useGlobalContext } from '@/context/GlobalProvider';

const EventCard = ({ event }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(''); // Adicionei para armazenar o papel do usuário
  const [confirmados, setConfirmados] = useState([]); // Lista de confirmados
  const { user } = useGlobalContext();


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
        setUserId(currentUser.userId);
        setUserRole(currentUser.role); // Adicionando o papel do usuário
      } catch (error) {
        console.error("Erro ao buscar o usuário atual:", error);
      }
    };

    fetchUser();

    // Carregar lista de confirmados se não estiver presente no objeto event
    if (event.Confirmados) {
      setConfirmados(event.Confirmados);
    } else {
      fetchConfirmados();
    }
  }, [event]);

  useEffect(() => {
    if (userId && confirmados.length > 0) {
      checkIfConfirmed(userId, confirmados);
    }
  }, [userId, confirmados]);
  

  // Função para buscar a lista de confirmados do evento
  const fetchConfirmados = async () => {
    try {
      const confirmadosList = await getEventsConfirmados(event.$id); // Função para obter a lista de confirmados pelo ID do evento
      setConfirmados(confirmadosList);
      checkIfConfirmed(userId, confirmadosList); // Verifica se o usuário está na lista de confirmados
    } catch (error) {
      console.error("Erro ao buscar confirmados:", error);
    }
  };

  // Verifica se o usuário já confirmou a presença
  const checkIfConfirmed = (userId, confirmadosList = confirmados) => {
    if (confirmadosList && confirmadosList.includes(userId)) {
      setIsConfirmed(true); // Usuário já confirmado
    }
  };

  // Função para confirmar presença
  const handleConfirmPresence = async () => {
    if (userId && !isConfirmed) {
      try {
        const updatedConfirmados = [...confirmados, userId]; // Adiciona o ID do usuário à lista
        await updateEventConfirmados(event.$id, updatedConfirmados); // Função para atualizar o evento no banco de dados

        setConfirmados(updatedConfirmados); // Atualiza a lista local de confirmados
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
        const updatedConfirmados = confirmados.filter((id) => id !== userId); // Remove o ID do usuário da lista
        await updateEventConfirmados(event.$id, updatedConfirmados); // Atualiza o evento no banco de dados

        setConfirmados(updatedConfirmados); // Atualiza a lista local de confirmados
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
        confirmados: confirmados.join(','), // Passa os IDs como uma string separada por vírgula
        eventTitle: event.Title, // Passando também o título do evento se necessário
        eventId: event.$id
      }
    });
  };

  // Função para ver confirmados (para o admin)
  const handleViewConfirmados = () => {
    router.push({
      pathname: '/ver_confirmados', // Nome da rota para a tela 'Ver Confirmados'
      params: {
        confirmados: confirmados.join(','), // Passa os IDs como uma string separada por vírgula
        eventTitle: event.Title, // Passando também o título do evento
        eventId: event.$id
      }
    });
  };

  return (
    <View style={{ marginBottom: 16, borderRadius: 8, backgroundColor: '#fff', padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8 }} 
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 10 }}></Text>
      )}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{event.Title}</Text>
      <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Local: {event.Local}</Text>
      <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Descrição: {event.Description}</Text>
      <Text style={{ fontSize: 14, color: '#777' }}>Data: {event.Date_event} - Hora: {event.Hora_event}</Text>

      {event.Type === 'partida' ? (
        <CustomButton title="Ver Relacionados" handlePress={handleViewRelated} containerStyles="mt-4 p-3 bg-verde" />
      ) : isConfirmed ? (
        <>
          <Text style={{ fontSize: 14, color: 'green', marginTop: 10 }}>Você já está inscrito neste evento</Text>
          <CustomButton title="Cancelar Presença" handlePress={handleCancelPresence} containerStyles="mt-4 p-3 bg-red-700" />
        </>
      ) : (
        <CustomButton title="Confirmar Presença" handlePress={handleConfirmPresence} containerStyles="mt-4 p-3 bg-verde" />
      )}

      {user.admin === 'admin' && event.Type === 'evento' && (
        <CustomButton title="Ver Confirmados" handlePress={handleViewConfirmados} containerStyles="mt-4 p-3 bg-verde" />
      )}
    </View>
  );
};

export default EventCard;
