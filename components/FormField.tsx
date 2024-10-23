import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { TextInputMask } from 'react-native-masked-text';
import { icons } from '@/constants';

const FormField = ({ value, placeholder, handleChangeText, maskType, options, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={{ marginVertical: 8 }}>
            <View style={{
                borderWidth: 1,
                borderColor: '#EFEFEF',  // cor clara para o contorno
                borderRadius: 10,
                backgroundColor: '#F8F8F8',  // cor de fundo similar ao print
                paddingHorizontal: 10,  // margem interna
                height: 48,  // altura do campo para ficar mais compacto
                flexDirection: 'row',  // permitir ícone e input lado a lado
                alignItems: 'center',  // centralizar verticalmente o conteúdo
                shadowColor: "#000", // Cor da sombra
                shadowOffset: { width: 0, height: 2 }, // Posição da sombra (abaixo)
                shadowOpacity: 0.2, // Opacidade da sombra
                shadowRadius: 4, // Difusão da sombra
                elevation: 5,
            }}>
                {maskType ? (
                    <TextInputMask
                        type={maskType} 
                        options={options}
                        value={value}
                        onChangeText={handleChangeText}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: '#000',
                        }}
                        placeholder={placeholder}
                        placeholderTextColor='#B5B5B5'  // cor mais suave para o placeholder
                        selectionColor='black'
                        {...props}
                    />
                ) : (
                    <TextInput
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: '#000',
                        }}
                        value={value}
                        placeholder={placeholder}
                        placeholderTextColor='#B5B5B5'  // cor mais suave para o placeholder
                        onChangeText={handleChangeText}
                        secureTextEntry={placeholder === 'Senha' && !showPassword}  // verificar se é campo de senha
                        selectionColor='black'
                        {...props}
                    />
                )}
                {placeholder === 'Senha' && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image 
                            source={!showPassword ? icons.eye : icons.eyeHide}
                            style={{ width: 24, height: 24 }}  // tamanho do ícone
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;
