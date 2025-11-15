import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar';

// Componente auxiliar para formatar valores monetários
const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

// Componente auxiliar para renderizar blocos de detalhes
const DetailCard = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardContent}>
            {children}
        </View>
    </View>
);

export default function ConfirmationScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    
    // Obtém os dados do pacote passados do TravelBudgetScreen
    const { packageData } = route.params || {};

    if (!packageData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Erro: Dados do pacote não encontrados.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Formatação de Datas - CORRIGIDA
    const formatDate = (dateString) => {
        if (!dateString) return 'Data não definida';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
        } catch (error) {
            return 'Data inválida';
        }
    };

    // --- Funções Auxiliares de Renderização CORRIGIDAS ---

    const renderTransport = (transport, type) => (
        <View key={transport?.id || Math.random()} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 
                    name={type === 'flight' ? "plane" : "bus"} 
                    size={16} 
                    color="#1D4780" 
                />
                <Text style={styles.itemTitle}>
                    {type === 'flight' ? 'Transporte: ' : 'Transporte Local: '} 
                    {transport?.tipo || 'Não especificado'}
                </Text>
            </View>
            <Text style={styles.itemDetail}>Descrição: {transport?.descricao || 'N/A'}</Text>
            <Text style={styles.itemDetail}>
                Custo: {formatCurrency(transport?.preco_estimado || transport?.preco)}
            </Text>
        </View>
    );

    const renderAccommodation = (accommodation) => (
        <View key={accommodation?.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="hotel" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Hospedagem: {accommodation?.nome || 'Não especificada'}</Text>
            </View>
            <Text style={styles.itemDetail}>Endereço: {accommodation?.endereco || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Cidade: {accommodation?.cidade || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Categoria: {accommodation?.categoria || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(accommodation?.preco)}</Text>
        </View>
    );

    const renderFood = (food) => (
        <View key={food?.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="utensils" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Alimentação: {food?.tipo || 'Não especificada'}</Text>
            </View>
            <Text style={styles.itemDetail}>Descrição: {food?.descricao || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Categoria: {food?.categoria || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(food?.preco)}</Text>
        </View>
    );

    const renderActivity = (activity) => (
        <View key={activity?.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Atividade: {activity?.nome || 'Não especificada'}</Text>
            </View>
            <Text style={styles.itemDetail}>Descrição: {activity?.descricao || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Categoria: {activity?.categoria || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(activity?.preco)}</Text>
        </View>
    );

    const renderInterest = (interest) => (
        <View key={interest?.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="heart" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Interesse: {interest?.nome || 'Não especificado'}</Text>
            </View>
            <Text style={styles.itemDetail}>Descrição: {interest?.descricao || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Categoria: {interest?.categoria || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(interest?.preco)}</Text>
        </View>
    );

    const renderEvent = (event) => (
        <View key={event?.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="calendar-alt" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Evento: {event?.nome || 'Não especificado'}</Text>
            </View>
            <Text style={styles.itemDetail}>Descrição: {event?.descricao || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Data: {formatDate(event?.data_hora)}</Text>
            <Text style={styles.itemDetail}>Categoria: {event?.categoria || 'N/A'}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(event?.preco)}</Text>
        </View>
    );

    // Extrair dados da estrutura correta do pacote
    const items = packageData.items || {};
    const destination = packageData.destination || packageData.destino || 'Destino não especificado';
    const budget = packageData.budget || packageData.orcamento || 0;
    const totalCost = packageData.totalCost || 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pacote Gerado com Sucesso!</Text>
                    <Text style={styles.subtitle}>Sua viagem para {destination} está pronta.</Text>
                </View>

                {/* --- RESUMO GERAL --- */}
                <DetailCard title="Resumo da Viagem">
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Destino:</Text> {destination}
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Período:</Text> {formatDate(packageData.dateIn)} a {formatDate(packageData.dateOut)} ({packageData.numDays || 0} dias)
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Pessoas:</Text> {packageData.adults || 0} Adultos e {packageData.children || 0} Crianças
                    </Text>
                    <Text style={[styles.summaryText, styles.totalBudget]}>
                        <Text style={{ fontWeight: 'bold' }}>Orçamento Definido:</Text> {formatCurrency(budget)}
                    </Text>
                    <Text style={[styles.summaryText, styles.totalCost]}>
                        <Text style={{ fontWeight: 'bold' }}>Custo Total Estimado:</Text> {formatCurrency(totalCost)}
                    </Text>
                </DetailCard>

                {/* --- HOSPEDAGEM --- */}
                <DetailCard title="Hospedagem">
                    {items.accommodation ? (
                        renderAccommodation(items.accommodation)
                    ) : (
                        <Text style={styles.noDataText}>Hospedagem não incluída no pacote.</Text>
                    )}
                </DetailCard>

                {/* --- TRANSPORTE PARA O DESTINO --- */}
                <DetailCard title="Transporte para o Destino">
                    {items.destinationTransport ? (
                        renderTransport(items.destinationTransport, 'flight')
                    ) : (
                        <Text style={styles.noDataText}>Transporte para o destino não incluído.</Text>
                    )}
                </DetailCard>

                {/* --- TRANSPORTE LOCAL --- */}
                <DetailCard title="Transporte Local">
                    {items.localTransport ? (
                        renderTransport(items.localTransport, 'local')
                    ) : (
                        <Text style={styles.noDataText}>Transporte local não incluído.</Text>
                    )}
                </DetailCard>

                {/* --- ALIMENTAÇÃO --- */}
                <DetailCard title="Alimentação">
                    {items.food && items.food.length > 0 ? (
                        items.food.map(renderFood)
                    ) : (
                        <Text style={styles.noDataText}>Opções de alimentação não incluídas.</Text>
                    )}
                </DetailCard>

                {/* --- ATIVIDADES --- */}
                <DetailCard title="Atividades">
                    {items.activities && items.activities.length > 0 ? (
                        items.activities.map(renderActivity)
                    ) : (
                        <Text style={styles.noDataText}>Nenhuma atividade incluída.</Text>
                    )}
                </DetailCard>

                {/* --- INTERESSES --- */}
                <DetailCard title="Interesses">
                    {items.interests && items.interests.length > 0 ? (
                        items.interests.map(renderInterest)
                    ) : (
                        <Text style={styles.noDataText}>Nenhum interesse incluído.</Text>
                    )}
                </DetailCard>

                {/* --- EVENTOS --- */}
                <DetailCard title="Eventos">
                    {items.events && items.events.length > 0 ? (
                        items.events.map(renderEvent)
                    ) : (
                        <Text style={styles.noDataText}>Nenhum evento incluído.</Text>
                    )}
                </DetailCard>

                <View style={styles.actionArea}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={() => Alert.alert("Salvar", "Funcionalidade de salvar pacote em desenvolvimento.")}
                    >
                        <Text style={styles.buttonText}>Salvar Pacote</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.newTripButton]}
                        onPress={() => navigation.navigate('MainScreen')}
                    >
                        <Text style={[styles.buttonText, styles.newTripButtonText]}>Nova Viagem</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7f9' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    
    header: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1D4780', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#6c757d', marginTop: 5, textAlign: 'center' },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
    
    // Cards de Detalhes
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
        paddingBottom: 5,
    },
    cardContent: {
        paddingHorizontal: 5,
    },

    // Itens e Detalhes
    itemContainer: {
        marginBottom: 15,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#3A8FFF',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D4780',
        marginLeft: 5,
    },
    itemDetail: {
        fontSize: 14,
        color: '#495057',
        marginLeft: 25,
        marginBottom: 2,
    },
    noDataText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },

    // Resumo Geral
    summaryText: {
        fontSize: 15,
        color: '#495057',
        marginBottom: 5,
    },
    totalBudget: {
        marginTop: 10,
        color: '#007bff',
        fontWeight: 'bold',
    },
    totalCost: {
        color: '#28a745',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Botões
    actionArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 5,
    },
    saveButton: { 
        backgroundColor: '#3A8FFF',
    },
    newTripButton: { 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#3A8FFF',
    },
    newTripButtonText: { 
        color: '#3A8FFF',
    },
    buttonText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#fff',
    },
    backButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#3A8FFF',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    }
});