import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, leftIcon }) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-verde rounded-xl min-h-[30px]
      justify-center items-center flex-row ${containerStyles} 
      ${isLoading ? 'opacity-50' : ''}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          {/* Verifica se há um ícone à esquerda */}
          {leftIcon && (
            <View className="mr-2">
              {leftIcon}
            </View>
          )}
          <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
