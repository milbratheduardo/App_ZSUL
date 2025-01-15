import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import CustomButton from './CustomButton'; // Botão reutilizável
import { getImageUrl, getCurrentUser, updateEventConfirmados, getEventsConfirmados } from '@/lib/appwrite';
import { router } from 'expo-router'; // Importe o router do expo-router
import { useGlobalContext } from '@/context/GlobalProvider';

const EventCard2 = ({ event }) => {
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

    </View>
  );
};

export default EventCard2;
