import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// onDestinationSelect AGORA recebe (nome, minBudgetRef, maxBudgetRef, minRoom, maxRoom, minPerPerson, maxPerPerson)
const DestinationSearchInput = ({ API_BASE_URL, onDestinationSelect }) => {
    const [destinationInput, setDestinationInput] = useState('');
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Efeito para buscar sugestões de cidades
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (destinationInput.length < 3) {
                setDestinationSuggestions([]);
                return;
            }

            const userToken = await AsyncStorage.getItem('userToken');

            if (!userToken) {
                console.error('Token ausente. Não é possível buscar sugestões.');
                return;
            }

            setLoadingSuggestions(true);

            try {
                const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destinationInput}`, {
                    headers: { 
                        'Authorization': `Bearer ${userToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Erro na API de sugestões: ${response.status}`);
                }
                const data = await response.json();
                setDestinationSuggestions(data);
            } catch (error) {
                console.error('Erro ao buscar sugestões de destino:', error);
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


    // handleDestinationSelect: Chamado ao selecionar uma cidade. Busca o orçamento BASE.
    const handleDestinationSelect = async (selectedDestination) => {
        setDestinationInput(selectedDestination);
        setShowSuggestions(false);
        setIsFetchingDetails(true);

        let userToken = null;
        try {
            userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
            console.error("Erro ao recuperar token do AsyncStorage:", e);
            Alert.alert("Erro", "Não foi possível buscar seu token de sessão.");
            setIsFetchingDetails(false);
            return;
        }

        // === BUSCA DO ORÇAMENTO BASE DE REFERÊNCIA (Sem numPeople/numDays) ===
        try {
            const detailsResponse = await fetch(`${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(selectedDestination)}`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (!detailsResponse.ok) {
                const errorData = await detailsResponse.json();
                // O erro 404 será capturado aqui se a cidade não tiver dados de custo no banco
                throw new Error(errorData.message || `Erro ao buscar detalhes da cidade: ${detailsResponse.status}`);
            }

            const cityDetails = await detailsResponse.json();

            // Desestruturando e definindo defaults para os novos campos
            const minBudgetRef = cityDetails.minBudget || 0;
            const maxBudgetRef = cityDetails.maxBudget || 5000;
            const minDailyRoom = cityDetails.minDailyRoom || 0;
            const maxDailyRoom = cityDetails.maxDailyRoom || 0;
            const minDailyPerPerson = cityDetails.minDailyPerPerson || 0;
            const maxDailyPerPerson = cityDetails.maxDailyPerPerson || 0;

            // Chama a prop do componente pai, passando todos os dados de referência
            onDestinationSelect(
                selectedDestination,
                minBudgetRef,
                maxBudgetRef,
                minDailyRoom,
                maxDailyRoom,
                minDailyPerPerson,
                maxDailyPerPerson
            );

        } catch (error) {
            console.error('Erro ao buscar detalhes do orçamento:', error);
            Alert.alert("Erro", error.message || "Não foi possível carregar o orçamento para este destino. Usando o padrão.");

            // Notifica o componente pai com valores padrão em caso de erro
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
            {/* Mostra o indicador de carregamento enquanto busca sugestões OU detalhes (orçamento) */}
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