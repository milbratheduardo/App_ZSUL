import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native';
import CustomButton from './CustomButton';
import { getImageUrl, getCurrentUser, updateEventConfirmados, getEventsConfirmados } from '@/lib/appwrite';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';

const EventCard = ({ event }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [confirmados, setConfirmados] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoaded(false);

        // Buscar imagem do evento
        if (event.ImageID) {
          const url = await getImageUrl(event.ImageID);
          setImageUrl(url);
        }

        // Buscar usuário atual
        const currentUser = await getCurrentUser();
        setUserId(currentUser.userId);
        setUserRole(currentUser.role);

        // Buscar lista de confirmados
        if (event.Confirmados) {
          setConfirmados(event.Confirmados);
          checkIfConfirmed(currentUser.userId, event.Confirmados);
        } else {
          const confirmadosList = await getEventsConfirmados(event.$id);
          setConfirmados(confirmadosList);
          checkIfConfirmed(currentUser.userId, confirmadosList);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [event]);

  const checkIfConfirmed = (userId, confirmadosList = confirmados) => {
    if (confirmadosList && confirmadosList.includes(userId)) {
      setIsConfirmed(true);
    }
  };

  const handleConfirmPresence = async () => {
    if (userId && !isConfirmed) {
      try {
        const updatedConfirmados = [...confirmados, userId];
        await updateEventConfirmados(event.$id, updatedConfirmados);

        setConfirmados(updatedConfirmados);
        setIsConfirmed(true);
        Alert.alert('Sucesso', 'Você confirmou presença no evento');
      } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        Alert.alert('Erro', 'Não foi possível confirmar a presença');
      }
    }
  };

  const handleCancelPresence = async () => {
    if (userId && isConfirmed) {
      try {
        const updatedConfirmados = confirmados.filter((id) => id !== userId);
        await updateEventConfirmados(event.$id, updatedConfirmados);

        setConfirmados(updatedConfirmados);
        setIsConfirmed(false);
        Alert.alert('Sucesso', 'Você cancelou sua presença no evento');
      } catch (error) {
        console.error('Erro ao cancelar presença:', error);
        Alert.alert('Erro', 'Não foi possível cancelar a presença');
      }
    }
  };

  const handleViewRelated = () => {
    router.push({
      pathname: '/ver_relacionados',
      params: {
        eventTitle: event.Title,
        eventId: event.$id,
      },
    });
  };

  const handleViewConfirmados = () => {
    router.push({
      pathname: '/ver_confirmados',
      params: {
        eventTitle: event.Title,
        eventId: event.$id,
      },
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

      {isDataLoaded ? (
        event.Type === 'partida' ? (
          <CustomButton title="Ver Relacionados" handlePress={handleViewRelated} containerStyles="mt-4 p-3 bg-verde" />
        ) : isConfirmed ? (
          <>
            <Text style={{ fontSize: 14, color: 'green', marginTop: 10 }}>Você já está inscrito neste evento</Text>
            <CustomButton title="Cancelar Presença" handlePress={handleCancelPresence} containerStyles="mt-4 p-3 bg-red-700" />
          </>
        ) : (
          <CustomButton title="Confirmar Presença" handlePress={handleConfirmPresence} containerStyles="mt-4 p-3 bg-verde" />
        )
      ) : (
        <ActivityIndicator size="large" color="#126046" style={{ marginTop: 20 }} />
      )}

      {user.admin === 'admin' && event.Type === 'evento' && isDataLoaded && (
        <CustomButton title="Ver Confirmados" handlePress={handleViewConfirmados} containerStyles="mt-4 p-3 bg-verde" />
      )}
    </View>
  );
};

export default EventCard;
