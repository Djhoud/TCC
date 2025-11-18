import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const DestinationSearchInput = ({ API_BASE_URL, onDestinationSelect }) => {
    const [destinationInput, setDestinationInput] = useState('');
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (destinationInput.length < 3) {
                setDestinationSuggestions([]);
                return;
            }

            const userToken = await AsyncStorage.getItem('userToken');

            if (!userToken) {
                console.log('Token ausente. Não é possível buscar sugestões.');
                return;
            }

            setLoadingSuggestions(true);

            try {
                const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destinationInput}`, {
                    headers: { 
                        'Authorization': `Bearer ${userToken}`,
                    },
                });

                // ✅ VERIFICAÇÃO SILENCIOSA
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.log('Resposta de sugestões não é JSON, usando array vazio');
                    setDestinationSuggestions([]);
                    return;
                }

                if (!response.ok) {
                    console.log('Resposta de sugestões não OK, usando array vazio');
                    setDestinationSuggestions([]);
                    return;
                }

                const data = await response.json();
                setDestinationSuggestions(data);
            } catch (error) {
                console.log('Erro ao buscar sugestões de destino:', error.message);
                setDestinationSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        const handler = setTimeout(() => {
            fetchSuggestions();
        }, 500);

        return () => clearTimeout(handler);
    }, [destinationInput, API_BASE_URL]);

const handleDestinationSelect = async (selectedDestination) => {
    setDestinationInput(selectedDestination);
    setShowSuggestions(false);
    setIsFetchingDetails(true);

    let userToken = null;
    try {
        userToken = await AsyncStorage.getItem('userToken');
    } catch (e) {
        onDestinationSelect(selectedDestination, 0, 5000, 0, 0, 0, 5000);
        setIsFetchingDetails(false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(selectedDestination)}`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });

        // ✅ MÉTODO SUPER SILENCIOSO
        const responseText = await response.text();
        
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            try {
                const cityDetails = JSON.parse(responseText);
                
                const minBudgetRef = cityDetails.minBudget || 0;
                const maxBudgetRef = cityDetails.maxBudget || 5000;
                const minDailyRoom = cityDetails.minDailyRoom || 0;
                const maxDailyRoom = cityDetails.maxDailyRoom || 0;
                const minDailyPerPerson = cityDetails.minDailyPerPerson || 0;
                const maxDailyPerPerson = cityDetails.maxDailyPerPerson || 0;

                onDestinationSelect(
                    selectedDestination,
                    minBudgetRef,
                    maxBudgetRef,
                    minDailyRoom,
                    maxDailyRoom,
                    minDailyPerPerson,
                    maxDailyPerPerson
                );
                return;
                
            } catch (parseError) {
                // Silencia erro de parse
            }
        }
        
        //  Valores padrão se não conseguir parsear
        onDestinationSelect(selectedDestination, 0, 5000, 0, 0, 0, 5000);

    } catch (error) {
        onDestinationSelect(selectedDestination, 0, 5000, 0, 0, 0, 5000);
    } finally {
        setIsFetchingDetails(false);
    }
};

    return (
        <View>
            <Text style={styles.label}>Destino:</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite o destino (ex: São Paulo)"
                value={destinationInput}
                onChangeText={(text) => {
                    setDestinationInput(text);
                    setShowSuggestions(true);
                }}
                onFocus={() => {
                    if (destinationSuggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                }}
            />
            {(loadingSuggestions || isFetchingDetails) && (
                <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 5 }} />
            )}
            {showSuggestions && destinationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {destinationSuggestions.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleDestinationSelect(item.nome)}
                        >
                            <Text style={styles.suggestionText}>{item.nome}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#343a40',
    },
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 5,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    suggestionText: {
        fontSize: 16,
        color: '#495057',
    },
});

export default DestinationSearchInput;