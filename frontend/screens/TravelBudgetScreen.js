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
    // Garantindo que a URL da API não tenha o "/" final
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
        // Se as datas não estiverem definidas, assume 1 dia para o cálculo inicial
        if (!dIn || !dOut) return 1; 

        const oneDay = 1000 * 60 * 60 * 24;
        // As datas devem ser normalizadas para o início do dia para evitar problemas de fuso horário
        const date1 = new Date(dIn.getFullYear(), dIn.getMonth(), dIn.getDate());
        const date2 = new Date(dOut.getFullYear(), dOut.getMonth(), dOut.getDate());

        const diffTime = date2.getTime() - date1.getTime();
        
        // Se a data de volta for antes da ida, retorna 0 dias. O handleConcluir validará.
        if (diffTime < 0) return 0; 
        
        const diffDays = Math.ceil(diffTime / oneDay);

        // Garante no mínimo 1 dia (para viagens de ida e volta no mesmo dia)
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

    // --- FUNÇÃO DE BUSCA DO ORÇAMENTO (MIN E MAX) ---
    const fetchCityBudget = async (cityName, numDays, numPeople) => {
        // Verifica as condições mínimas antes de fazer a chamada
        if (!cityName || numPeople === 0 || numDays === 0) return;

        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
            console.warn('Token de usuário não encontrado. Orçamento não será atualizado.');
            setMinBudgetSlider(100);
            setMaxBudgetSlider(5000);
            setBudget(1000);
            return;
        }
        
        // CORREÇÃO CRÍTICA APLICADA: Adicionado o prefixo "/api"
        const url = `${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(cityName)}&numPeople=${numPeople}&numDays=${numDays}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

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

            // Garantindo que os valores são números válidos
            const newMin = Number(data.minBudget) || 0;
            const newMax = Number(data.maxBudget) || 5000;
            
            // 1. Atualiza os limites do slider
            setMinBudgetSlider(newMin);
            setMaxBudgetSlider(newMax);

            // 2. Garante que o valor ATUAL (budget) esteja dentro dos NOVOS limites
            if (budget < newMin || budget > newMax) {
                // Redefine para o novo mínimo se estiver fora, ou para um valor intermediário
                setBudget(Math.max(newMin, Math.min(budget, newMax)));
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes do orçamento da cidade:', error.message);
            Alert.alert("Erro de Orçamento", error.message || "Erro desconhecido ao carregar dados.");

            // Resetar sliders em caso de erro
            setMinBudgetSlider(100);
            setMaxBudgetSlider(5000);
            setBudget(1000);
        }
    };
    
    // --- LÓGICA DE RE-CÁLCULO CENTRALIZADA (useEffect) ---
    // Este hook garante que o orçamento total seja recalculado sempre que qualquer variável de entrada mudar.
    useEffect(() => {
        // Calcula as variáveis dependentes
        const travelDays = getTravelDays(dateIn, dateOut);
        const numPeople = adults + children;
        
        // Só tenta buscar se tivermos informações básicas suficientes
        if (destination && numPeople > 0 && travelDays > 0) {
            fetchCityBudget(destination, travelDays, numPeople);
        } else if (!destination) {
             // Reseta o range do slider se não houver destino
            setMinBudgetSlider(0);
            setMaxBudgetSlider(5000);
            setBudget(1000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination, dateIn, dateOut, adults, children]);


    // --- HANDLERS DE DESTINO ---
    const handleDestinationSelect = (selectedDestination) => {
        // Ao selecionar, apenas atualiza o estado de destino.
        // O useEffect acima se encarrega de chamar o fetchCityBudget
        setDestination(selectedDestination);
    };


    // --- HANDLERS DE DATA CORRIGIDOS ---
    const handleDateChange = (type, event, selectedDate) => {
        if (type === 'in') setShowDateInPicker(false);
        if (type === 'out') setShowDateOutPicker(false);

        if (selectedDate) {
            if (type === 'in') {
                const newDateIn = new Date(selectedDate);
                let newDateOut = dateOut;
                
                // Se a nova data de entrada for posterior à saída, ajusta a saída.
                if (dateOut && newDateIn > dateOut) {
                    newDateOut = newDateIn;
                    setDateOut(newDateOut);
                }
                setDateIn(newDateIn);
                
            } else { // type === 'out'
                setDateOut(new Date(selectedDate));
            }
            // O useEffect cuidará do re-cálculo do fetchCityBudget
        }
    };

    // --- LÓGICA DE ATUALIZAÇÃO DE PESSOAS ---
    const updatePeopleCount = (newAdults, newChildren) => {
        // Garante que o número total de pessoas seja pelo menos 1
        if (newAdults + newChildren === 0) {
            Alert.alert("Atenção", "Deve haver pelo menos 1 viajante (adulto ou criança).");
            return;
        }

        setAdults(newAdults);
        setChildren(newChildren);
        
        // O useEffect cuidará do re-cálculo do fetchCityBudget
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
        
        // O orçamento é sempre válido pois o slider define um range.
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
            const response = await fetch(`${API_BASE_URL}/packages/generate`, {
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

    // --- NOVO COMPONENTE AUXILIAR (EMBUTIDO) ---
    // Removendo 'setCount' das props, pois a atualização é feita via updatePeopleCount
    const Counter = ({ label, count, min }) => {
        const handleIncrement = () => {
            if (label === 'Adultos') {
                updatePeopleCount(count + 1, children);
            } else {
                updatePeopleCount(adults, count + 1);
            }
        };

        const handleDecrement = () => {
            // Condição base de decremento (se for maior que o mínimo)
            let canDecrement = count > min;
            
            // Regra especial: o total de pessoas (adultos + crianças) deve ser > 0
            if (label === 'Adultos' && count === 1 && children === 0) {
                canDecrement = false; // Não pode decrementar se for o último viajante
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
        const isDisabled = count === min && !isMinAdultDisabled; // Desabilita se for o mínimo, a menos que seja o último adulto

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

                    {/* Pessoas (InputRow) */}
                    <View style={[styles.inputRow, { marginBottom: 30 }]}>
                        {/* MÍNIMO DE ADULTOS AJUSTADO PARA 1 */}
                        <View style={styles.peopleInput}>
                            <Counter 
                                label="Adultos" 
                                count={adults} 
                                min={1} // Mínimo de 1 adulto
                            />
                        </View>

                        <View style={styles.peopleInput}>
                            <Counter 
                                label="Crianças" 
                                count={children} 
                                min={0} 
                            />
                        </View>
                    </View>

                    {/* === SEÇÃO DE ORÇAMENTO === */}
                    <View style={styles.budgetSection}>
                        <View style={styles.sliderWrapper}>
                            {/* É crucial não usar o 'key' no BudgetSlider, pois o BudgetSlider.js já contém um useEffect para se ajustar aos novos limites (minimumValue e maximumValue) sem ser totalmente remontado. */}
                            <BudgetSlider
                                budget={budget}
                                setBudget={setBudget}
                                minimumValue={minBudgetSlider}
                                maximumValue={maxBudgetSlider}
                            />
                            {/* Exibir o range dinâmico */}
                            <Text style={styles.budgetRangeText}>
                                Orçamento Estimado: {formatCurrency(minBudgetSlider)} a {formatCurrency(maxBudgetSlider)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* === ÁREA AZUL (IMAGEM E BOTÕES) === */}
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

            {/* DatePickers (Componentes de Data) */}
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

    whiteAreaContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        paddingBottom: 10,
    },
    destinationContainer: { marginBottom: 20 },
    
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    datePickerButton: { flex: 1, marginHorizontal: 5 },
    peopleInput: { flex: 1, marginHorizontal: 5 },
    
    // Estilos de Data/Input Padrão
    dateLabel: { fontSize: 12, color: '#999', position: 'absolute', top: 5, left: 10, zIndex: 10 },
    dateText: { fontSize: 16, color: '#343a40', marginTop: 8, textAlign: 'center' },
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

    // Estilos do Contador (NOVO)
    counterContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        paddingTop: 12,
        paddingBottom: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        position: 'relative',
    },
    counterControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    counterButton: {
        padding: 5,
        borderRadius: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    counterText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#343a40',
    },

    // Estilos do Orçamento
    budgetSection: { paddingHorizontal: 5, marginTop: 10, marginBottom: 30 },
    sliderWrapper: { alignItems: 'center', paddingHorizontal: 7, marginTop: 10 },
    budgetRangeText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 15,
        fontWeight: '500',
    },

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