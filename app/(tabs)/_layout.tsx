import { View, Text, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <Image 
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className="w-6 h-6"
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}>
        {name}
      </Text>
    </View>
  );
}

const TabsLayout = () => {
  const { user } = useGlobalContext(); 
  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role); 
    }
  }, [user]);

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 63 }        }}
      >

        <Tabs.Screen 
          name='turmas'
          options={{
            title: 'Turmas',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.alunos}
                color={color}
                name="Turmas"
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='alunos'
          options={{
            title: 'Alunos',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.turmas}
                color={color}
                name="Alunos"
                focused={focused}
              />
            )
          }}
        />
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
            )
          }}
        />
        <Tabs.Screen 
          name='history'
          options={{
            title: 'Nossa História',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.trophy}
                color={color}
                name="História"
                focused={focused}
              />
            )
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
            )
          }}
        />
      </Tabs>
    </View>
  );
}

export default TabsLayout;
