import { View, Text, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
  const iconColor = focused ? '#126046' : '#808080';
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Image 
        source={icon}
        resizeMode='contain'
        style={{ tintColor: iconColor, width: 22, height: 26 }}
      />
      <Text style={{ 
        fontSize: focused ? 8 : 8, // Ajuste o tamanho da fonte aqui
        color: focused ? '#126046' : '#808080', 
        fontWeight: focused ? '600' : '400' 
      }}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const { user } = useGlobalContext(); 

  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role); 
    }
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 50,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
          },
        }}
      >
        <Tabs.Screen 
          name='eventos'
          options={{
            title: 'Eventos',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.calendario}
                color={color}
                name="Eventos"
                focused={focused}
              />
            ),
          }}
        />
        
        <Tabs.Screen 
          name='galeria'
          options={{
            title: 'Galeria',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.gallery}
                color={color}
                name="Galeria"
                focused={focused}
              />
            ),
          }}
        />
        
        <Tabs.Screen 
          name='turmas'
          options={{
            title: 'Turmas',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.alunos}
                color={color}
                name="Início"
                focused={focused}
              />
            ),
          }}
        />
        
        <Tabs.Screen 
          name='history'
          options={{
            title: 'Nossa História',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.turmas}
                color={color}
                name="Atletas"
                focused={focused}
              />
            ),
          }}
        />
        
        <Tabs.Screen 
          name='profile'
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;
