import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');

    // --- ESTADOS ---
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState(1000);
    const [minBudgetSlider, setMinBudgetSlider] = useState(0);
    const [maxBudgetSlider, setMaxBudgetSlider] = useState(5000);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [dateIn, setDateIn] = useState(null);
    const [dateOut, setDateOut] = useState(null);
    const [showDateInPicker, setShowDateInPicker] = useState(false);
    const [showDateOutPicker, setShowDateOutPicker] = useState(false);
    const [loadingNavigation, setLoadingNavigation] = useState(false);

    // --- FUNÇÕES AUXILIARES ---
    const getTravelDays = (dIn, dOut) => {
        if (!dIn || !dOut) return 1;
        const oneDay = 1000 * 60 * 60 * 24;
        const date1 = new Date(dIn.getFullYear(), dIn.getMonth(), dIn.getDate());
        const date2 = new Date(dOut.getFullYear(), dOut.getMonth(), dOut.getDate());
        const diffTime = date2.getTime() - date1.getTime();
        if (diffTime < 0) return 0;
        const diffDays = Math.ceil(diffTime / oneDay);
        return Math.max(1, diffDays);
    };

    const formatDateDisplay = (date) => {
        if (!date) return 'DD/MM/AA';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

// ✅ CORREÇÃO FINAL NO FRONTEND
const fetchCityBudget = async (cityName, numDays, numPeople) => {
    if (!cityName || numPeople === 0 || numDays === 0) {
        console.log('⚠️ Dados insuficientes para calcular orçamento');
        return;
    }

    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
        console.warn('Token de usuário não encontrado.');
        setMinBudgetSlider(500);
        setMaxBudgetSlider(3000);
        setBudget(1500);
        return;
    }
    
    const url = `${API_BASE_URL}/api/cities/package?cityName=${encodeURIComponent(cityName)}&numPeople=${numPeople}&numDays=${numDays}`;

    try {
        console.log('🔄 Buscando orçamento para:', { cityName, numPeople, numDays });
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('✅ Resposta do backend:', data);
        
        // ✅ VALIDAÇÃO ROBUSTA
        let minValue = Number(data.minBudget);
        let maxValue = Number(data.maxBudget);
        
        if (isNaN(minValue) || isNaN(maxValue) || minValue >= maxValue) {
            console.warn('Valores inválidos do backend, usando fallback');
            minValue = 500;
            maxValue = 3000;
        }
        
        // ✅ LIMITES DE SEGURANÇA
        const MAX_SAFE_BUDGET = 10000;
        const adjustedMin = Math.min(minValue, MAX_SAFE_BUDGET);
        const adjustedMax = Math.min(maxValue, MAX_SAFE_BUDGET * 1.2);
        
        // Garantir faixa mínima
        const finalMin = Math.max(100, adjustedMin);
        const finalMax = Math.max(finalMin + 200, adjustedMax);
        
        console.log('🎯 Valores ajustados para slider:', { finalMin, finalMax });
        
        setMinBudgetSlider(finalMin);
        setMaxBudgetSlider(finalMax);
        setBudget(Math.round((finalMin + finalMax) / 2));
        
    } catch (error) {
        console.error('❌ Erro ao buscar orçamento:', error.message);
        Alert.alert("Erro", "Não foi possível carregar os valores de orçamento.");
        // Valores conservadores como fallback
        setMinBudgetSlider(500);
        setMaxBudgetSlider(3000);
        setBudget(1500);
    }
};
    // --- LÓGICA DE RE-CÁLCULO ---
    useEffect(() => {
        const travelDays = getTravelDays(dateIn, dateOut);
        const numPeople = adults + children;
        
        console.log('DEBUG - Recalculando orçamento:', {
            destination,
            travelDays, 
            numPeople,
            dateIn: dateIn?.toISOString(),
            dateOut: dateOut?.toISOString()
        });
        
        if (destination && numPeople > 0 && travelDays > 0) {
            fetchCityBudget(destination, travelDays, numPeople);
        } else if (!destination) {
            setMinBudgetSlider(0);
            setMaxBudgetSlider(5000);
            setBudget(1000);
        }
    }, [destination, dateIn, dateOut, adults, children]);

    // --- HANDLERS ---
    const handleDestinationSelect = (selectedDestination) => {
        setDestination(selectedDestination);
    };

    const handleDateChange = (type, event, selectedDate) => {
        if (type === 'in') setShowDateInPicker(false);
        if (type === 'out') setShowDateOutPicker(false);

        if (selectedDate) {
            if (type === 'in') {
                const newDateIn = new Date(selectedDate);
                let newDateOut = dateOut;
                
                if (dateOut && newDateIn > dateOut) {
                    newDateOut = newDateIn;
                    setDateOut(newDateOut);
                }
                setDateIn(newDateIn);
            } else {
                setDateOut(new Date(selectedDate));
            }
        }
    };

    const updatePeopleCount = (newAdults, newChildren) => {
        if (newAdults + newChildren === 0) {
            Alert.alert("Atenção", "Deve haver pelo menos 1 viajante (adulto ou criança).");
            return;
        }
        setAdults(newAdults);
        setChildren(newChildren);
    };

    // --- FUNÇÃO CONCLUIR ---
    const handleConcluir = async () => {
        const numPeople = adults + children;
        const travelDays = getTravelDays(dateIn, dateOut);

        // Validação
        if (!destination || !dateIn || !dateOut) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha o destino e as datas.');
            return;
        }
        
        if (numPeople === 0) {
            Alert.alert('Número de Pessoas', 'Pelo menos um adulto ou criança deve ser selecionado.');
            return;
        }

        if (travelDays <= 0) {
            Alert.alert('Datas Inválidas', 'A data de volta não pode ser anterior à data de ida.');
            return;
        }

        setLoadingNavigation(true);

        const packageParams = {
            orcamento: budget,
            destino: destination,
            adults,
            children,
            dateIn: dateIn.toISOString(),
            dateOut: dateOut.toISOString(),
            numPeople: numPeople, 
            numDays: travelDays, 
        };

        let userToken = null;
        try {
            userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                Alert.alert('Erro de Autenticação', 'Você precisa estar logado para gerar um pacote.');
                setLoadingNavigation(false);
                return;
            }
        } catch (e) {
            console.error('Erro ao recuperar token do AsyncStorage:', e);
            Alert.alert('Erro', 'Não foi possível acessar seus dados de sessão.');
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
            console.log('Resposta da API:', responseData); // DEBUG

            // CORREÇÃO CRÍTICA - Estrutura correta dos dados
            navigation.navigate('Confirmation', { 
                packageData: responseData.package || responseData, // Aceita ambas as estruturas
                travelData: {
                    destination: destination,
                    budget: budget,
                    adults: adults,
                    children: children,
                    dateIn: dateIn.toISOString(),
                    dateOut: dateOut.toISOString(),
                    numDays: travelDays
                }
            });
        } catch (error) {
            console.error('Erro ao gerar pacote de viagem:', error);
            Alert.alert('Erro', error.message || 'Não foi possível gerar o pacote de viagem.');
        } finally {
            setLoadingNavigation(false);
        }
    };

    // --- COMPONENTE COUNTER ---
    const Counter = ({ label, count, min }) => {
        const handleIncrement = () => {
            if (label === 'Adultos') {
                updatePeopleCount(count + 1, children);
            } else {
                updatePeopleCount(adults, count + 1);
            }
        };

        const handleDecrement = () => {
            let canDecrement = count > min;
            
            if (label === 'Adultos' && count === 1 && children === 0) {
                canDecrement = false;
            }

            if (canDecrement) {
                if (label === 'Adultos') {
                    updatePeopleCount(count - 1, children);
                } else {
                    updatePeopleCount(adults, count - 1);
                }
            }
        };

        const isMinAdultDisabled = label === 'Adultos' && count === 1 && children === 0;
        const isDisabled = count === min && !isMinAdultDisabled;

        return (
            <View style={styles.counterContainer}>
                <Text style={styles.dateLabel}>{label}</Text>
                <View style={styles.counterControl}>
                    <TouchableOpacity 
                        onPress={handleDecrement} 
                        style={[styles.counterButton, (isDisabled || isMinAdultDisabled) && styles.disabledButton]}
                        disabled={isDisabled || isMinAdultDisabled}
                    >
                        <FontAwesome5 name="minus" size={12} color={isDisabled || isMinAdultDisabled ? "#ccc" : "#1D4780"} />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{count}</Text>
                    <TouchableOpacity onPress={handleIncrement} style={styles.counterButton}>
                        <FontAwesome5 name="plus" size={12} color="#1D4780" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* ÁREA BRANCA */}
                <View style={styles.whiteAreaContent}>
                    <View style={styles.destinationContainer}>
                        <DestinationSearchInput
                            API_BASE_URL={API_BASE_URL}
                            onDestinationSelect={handleDestinationSelect}
                            initialValue={destination}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <TouchableOpacity onPress={() => setShowDateInPicker(true)} style={styles.datePickerButton}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Entrada</Text>
                                <Text style={styles.dateText}>{formatDateDisplay(dateIn)}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowDateOutPicker(true)} style={styles.datePickerButton}>
                            <View style={styles.inputField}>
                                <Text style={styles.dateLabel}>Saída</Text>
                                <Text style={styles.dateText}>{formatDateDisplay(dateOut)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.inputRow, { marginBottom: 30 }]}>
                        <View style={styles.peopleInput}>
                            <Counter label="Adultos" count={adults} min={1} />
                        </View>
                        <View style={styles.peopleInput}>
                            <Counter label="Crianças" count={children} min={0} />
                        </View>
                    </View>

                    <View style={styles.budgetSection}>
                        <View style={styles.sliderWrapper}>
                            <BudgetSlider
                                budget={budget}
                                setBudget={setBudget}
                                minimumValue={minBudgetSlider}
                                maximumValue={maxBudgetSlider}
                            />
                            <Text style={styles.budgetRangeText}>
                                Orçamento Estimado: {formatCurrency(minBudgetSlider)} a {formatCurrency(maxBudgetSlider)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ÁREA AZUL */}
                <View style={styles.blueAreaContent}>
                    <Image source={require('../assets/images/component/rio.png')} style={styles.bottomImage} />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => navigation.navigate('MainScreen')}
                        >
                            <Text style={[styles.buttonText, styles.editButtonText]}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.concluirButton]}
                            onPress={handleConcluir}
                            disabled={loadingNavigation}
                        >
                            {loadingNavigation ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gerar Pacote</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* DATEPICKERS */}
            {showDateInPicker && (
                <DateTimePicker
                    value={dateIn || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => handleDateChange('in', event, selectedDate)}
                    minimumDate={new Date()}
                />
            )}

            {showDateOutPicker && (
                <DateTimePicker
                    value={dateOut || (dateIn ? dateIn : new Date())}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => handleDateChange('out', event, selectedDate)}
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
    whiteAreaContent: { paddingHorizontal: 20, paddingTop: 50, backgroundColor: '#fff', paddingBottom: 10 },
    destinationContainer: { marginBottom: 20 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    datePickerButton: { flex: 1, marginHorizontal: 5 },
    peopleInput: { flex: 1, marginHorizontal: 5 },
    dateLabel: { fontSize: 12, color: '#999', position: 'absolute', top: 5, left: 10, zIndex: 10 },
    dateText: { fontSize: 16, color: '#343a40', marginTop: 8, textAlign: 'center' },
    inputField: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', height: 50 },
    counterContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingTop: 12, paddingBottom: 5, alignItems: 'center', justifyContent: 'center', height: 50, position: 'relative' },
    counterControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
    counterButton: { padding: 5, borderRadius: 5 },
    disabledButton: { opacity: 0.5 },
    counterText: { fontSize: 16, fontWeight: '600', color: '#343a40' },
    budgetSection: { paddingHorizontal: 5, marginTop: 10, marginBottom: 30 },
    sliderWrapper: { alignItems: 'center', paddingHorizontal: 7, marginTop: 10 },
    budgetRangeText: { fontSize: 14, color: '#6c757d', marginTop: 15, fontWeight: '500' },
    blueAreaContent: { backgroundColor: '#3A8FFF', paddingHorizontal: 20, paddingBottom: 40, paddingTop: 50, borderTopLeftRadius: 50, borderTopRightRadius: 50, marginTop: -30 },
    bottomImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 25, resizeMode: 'cover' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 10, elevation: 5 },
    editButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3A8FFF' },
    editButtonText: { color: '#3A8FFF' },
    concluirButton: { backgroundColor: '#1D4780' },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});