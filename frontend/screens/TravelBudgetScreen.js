import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'; // Removido 'useEffect' obsoleto
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BudgetSlider from '../components/BudgetSlider';
import DestinationSearchInput from '../components/DestinationSearchInput';
import Navbar from '../components/Navbar';

export default function TravelBudgetScreen() {
    const navigation = useNavigation();
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    // --- ESTADOS CORRIGIDOS ---
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState(1000);
    const [minBudgetSlider, setMinBudgetSlider] = useState(0);
    const [maxBudgetSlider, setMaxBudgetSlider] = useState(5000);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    // Inicializados como null para usar objetos Date
    const [dateIn, setDateIn] = useState(null); 
    const [dateOut, setDateOut] = useState(null);
    const [showDateInPicker, setShowDateInPicker] = useState(false);
    const [showDateOutPicker, setShowDateOutPicker] = useState(false);
    const [loadingNavigation, setLoadingNavigation] = useState(false);

    // --- FUNÇÕES AUXILIARES ---

    // Calcula a diferença de dias entre duas datas (mínimo 1 dia)
    const getTravelDays = (dIn, dOut) => {
        if (!dIn || !dOut) return 1;
        
        const oneDay = 1000 * 60 * 60 * 24;
        const diffTime = dOut.getTime() - dIn.getTime();
        
        // Arredonda para cima para garantir que a diferença de um dia seja contada
        const diffDays = Math.ceil(diffTime / oneDay);
        
        return Math.max(1, diffDays); 
    };

    // Formata o objeto Date para exibição no formato DD/MM/AA
    const formatDateDisplay = (date) => {
        if (!date) return 'DD/MM/AA';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    // --- FUNÇÃO DE BUSCA DO ORÇAMENTO (MIN E MAX) ---
    const fetchCityBudget = async (cityName, dias = 1) => {
        if (!cityName) return;

        // Passa o parâmetro 'dias' para o Back-end
        const url = `${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(cityName)}&dias=${dias}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                let errorMessage = `Erro ao buscar orçamento: Status ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    console.warn('Resposta de erro da API sem corpo JSON: ' + response.status);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            // Atualiza os sliders com os valores do Back-end (que já estarão multiplicados por 'dias')
            setMinBudgetSlider(data.minBudget);
            setMaxBudgetSlider(data.maxBudget);
            
            if (budget < data.minBudget || budget > data.maxBudget || budget === 1000) { 
                setBudget(data.minBudget); 
            }

        } catch (error) {
            console.error('Erro ao buscar detalhes do orçamento da cidade:', error.message);
            Alert.alert("Erro de Orçamento", error.message || "Erro desconhecido ao carregar dados.");
            
            setMinBudgetSlider(100); 
            setMaxBudgetSlider(5000);
        }
    };

    // --- HANDLERS DE DATA CORRIGIDOS ---
    const handleDateInChange = (event, selectedDate) => {
        setShowDateInPicker(false);
        if (selectedDate) {
            let newDateIn = new Date(selectedDate);
            setDateIn(newDateIn);

            // Garante que a data de saída seja igual ou posterior à de entrada
            if (dateOut && newDateIn > dateOut) {
                setDateOut(newDateIn);
            }
            // Dispara a busca de orçamento
            if (destination) {
                fetchCityBudget(destination, getTravelDays(newDateIn, dateOut));
            }
        }
    };

    const handleDateOutChange = (event, selectedDate) => {
        setShowDateOutPicker(false);
        if (selectedDate) {
            let newDateOut = new Date(selectedDate);
            setDateOut(newDateOut);
            
            // Dispara a busca de orçamento
            if (destination) {
                fetchCityBudget(destination, getTravelDays(dateIn, newDateOut));
            }
        }
    };

    // --- HANDLERS DE DESTINO ---
    const handleDestinationSelect = (selectedDestination) => {
        setDestination(selectedDestination);
        // Dispara a busca de orçamento com a duração atual (1 dia se não selecionada)
        const travelDays = getTravelDays(dateIn, dateOut);
        fetchCityBudget(selectedDestination, travelDays);
    };

    // --- FUNÇÃO CONCLUIR CORRIGIDA ---
    const handleConcluir = async () => {
        // Validação de null (Date objects)
        if (!destination || !budget || !dateIn || !dateOut) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha o destino, o orçamento e as datas.');
            return;
        }

        if (adults === 0 && children === 0) {
            Alert.alert('Número de Pessoas', 'Pelo menos um adulto ou criança deve ser selecionado.');
            return;
        }

        // Validação de Datas (comparação direta de Date objects)
        if (dateOut < dateIn) {
            Alert.alert('Datas Inválidas', 'A data de volta não pode ser anterior à data de ida.');
            return;
        }

        const travelDays = getTravelDays(dateIn, dateOut);
        if (travelDays <= 0) {
            Alert.alert('Datas Inválidas', 'A viagem deve ter pelo menos um dia.');
            return;
        }

        setLoadingNavigation(true);
        
        // Envia as datas no formato ISO, que é o padrão correto para APIs
        const packageParams = {
            orcamento: budget,
            destino: destination,
            adults,
            children,
            dateIn: dateIn.toISOString(), 
            dateOut: dateOut.toISOString(),
            dias: travelDays, // Opcional, mas útil para o Back-end
        };

        let userToken = null;
        try {
            userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                Alert.alert('Erro de Autenticação', 'Você precisa estar logado para gerar um pacote. Por favor, faça login novamente.');
                setLoadingNavigation(false);
                return;
            }
        } catch (e) {
            console.error('Erro ao recuperar token do AsyncStorage:', e);
            Alert.alert('Erro', 'Não foi possível acessar seus dados de sessão. Tente novamente.');
            setLoadingNavigation(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/packages/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify(packageParams),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
            }

            const responseData = await response.json();
            navigation.navigate('Confirmation', { packageData: responseData.package });
        } catch (error) {
            console.error('Erro ao gerar pacote de viagem:', error);
            Alert.alert('Erro', error.message || 'Não foi possível gerar o pacote de viagem. Tente novamente.');
        } finally {
            setLoadingNavigation(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* === ÁREA BRANCA (INPUTS e SLIDER) === */}
                <View style={styles.whiteAreaContent}>
                    {/* Input de Destino */}
                    <View style={styles.destinationContainer}>
                        <DestinationSearchInput
                            API_BASE_URL={API_BASE_URL}
                            onDestinationSelect={handleDestinationSelect}
                            initialValue={destination}
                        />
                    </View>

                    {/* Datas (InputRow) */}
                    <View style={styles.inputRow}>
                        <TouchableOpacity onPress={() => setShowDateInPicker(true)} style={styles.datePickerButton}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Entrada</Text>
                                {/* Exibição formatada */}
                                <Text style={styles.dateText}>{formatDateDisplay(dateIn)}</Text> 
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowDateOutPicker(true)} style={styles.datePickerButton}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Saída</Text>
                                {/* Exibição formatada */}
                                <Text style={styles.dateText}>{formatDateDisplay(dateOut)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Pessoas (InputRow) */}
                    <View style={styles.inputRow}>
                        <View style={styles.peopleInput}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Adultos</Text>
                                {/* Garante que o número é renderizado como string */}
                                <Text style={styles.dateText}>{String(adults)}</Text> 
                            </View>
                        </View>

                        <View style={styles.peopleInput}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Crianças</Text>
                                {/* Garante que o número é renderizado como string */}
                                <Text style={styles.dateText}>{String(children)}</Text> 
                            </View>
                        </View>
                    </View>

                    {/* === SEÇÃO DE ORÇAMENTO === */}
                    <View style={styles.budgetSection}>
                        <View style={styles.sliderWrapper}>
                            <BudgetSlider
                                budget={budget}
                                setBudget={setBudget}
                                minimumValue={minBudgetSlider}
                                maximumValue={maxBudgetSlider}
                            />
                        </View>
                    </View>
                </View>

                {/* === ÁREA AZUL (IMAGEM E BOTÕES) === */}
                <View style={styles.blueAreaContent}>
                    <Image source={require('../assets/images/component/rio.png')} style={styles.bottomImage} />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                            <Text style={[styles.buttonText, styles.editButtonText]}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.concluirButton]}
                            onPress={handleConcluir}
                            disabled={loadingNavigation}
                        >
                            {loadingNavigation ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Concluir</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* DatePickers (Componentes de Data) */}
            {showDateInPicker && (
                <DateTimePicker
                    // Se dateIn for null, inicia com a data de hoje.
                    value={dateIn || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateInChange}
                />
            )}

            {showDateOutPicker && (
                <DateTimePicker
                    // Se dateOut for null, inicia com a data de hoje.
                    value={dateOut || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateOutChange}
                    // A data mínima deve ser a data de entrada (ou hoje, se não selecionada)
                    minimumDate={dateIn || new Date()}
                />
            )}
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 20 },

    whiteAreaContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        paddingBottom: 10,
    },
    destinationContainer: { marginBottom: 20 },
    indoParaLabel: { fontSize: 16, color: '#999', marginBottom: 5 },

    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    datePickerButton: { flex: 1, marginHorizontal: 5 },
    peopleInput: { flex: 1, marginHorizontal: 5 },
    dateLabel: { fontSize: 12, color: '#999', position: 'absolute', top: 5, left: 10, zIndex: 10 },
    dateText: { fontSize: 16, color: '#343a40', marginTop: 8 },
    inputField: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },

    budgetSection: { paddingHorizontal: 5, marginTop: -20, marginBottom: 30 },
    sliderWrapper: { alignItems: 'center', paddingHorizontal: 7, marginTop: 10 },

    budgetValueText: { fontSize: 24, fontWeight: 'bold', color: '#343a40', textAlign: 'center', marginBottom: 10 },
    minMaxInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 5 },
    minMaxInput: { width: '45%', textAlign: 'center', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 8, backgroundColor: '#f8f9fa', color: '#343a40' },
    minMaxSeparator: { color: '#343a40', fontSize: 20 },

    blueAreaContent: {
        backgroundColor: '#3A8FFF',
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 50,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        marginTop: -30,
    },

    bottomImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 25, resizeMode: 'cover' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 10, elevation: 5 },
    editButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3A8FFF' },
    editButtonText: { color: '#3A8FFF' },
    concluirButton: { backgroundColor: '#1D4780' },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});