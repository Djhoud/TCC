import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar';

// Componente auxiliar para formatar valores monetários
const formatCurrency = (amount) => {
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

    // --- Funções Auxiliares de Renderização de Conteúdo ---

    const renderFlight = (flight) => (
        <View key={flight.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="plane" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Voo: {flight.company}</Text>
            </View>
            <Text style={styles.itemDetail}>Rota: {flight.route}</Text>
            <Text style={styles.itemDetail}>Horário: {flight.time}</Text>
            <Text style={styles.itemDetail}>Custo: {formatCurrency(flight.cost)}</Text>
        </View>
    );

    const renderHotel = (hotel) => (
        <View key={hotel.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="hotel" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Hospedagem: {hotel.name}</Text>
            </View>
            <Text style={styles.itemDetail}>Estrelas: {hotel.stars} ★</Text>
            <Text style={styles.itemDetail}>Período: {hotel.period}</Text>
            <Text style={styles.itemDetail}>Custo Total: {formatCurrency(hotel.cost)}</Text>
        </View>
    );

    const renderActivity = (activity) => (
        <View key={activity.id} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#1D4780" />
                <Text style={styles.itemTitle}> Atividade: {activity.name}</Text>
            </View>
            <Text style={styles.itemDetail}>Dia: {activity.day}</Text>
            <Text style={styles.itemDetail}>Custo (por pessoa): {activity.cost > 0 ? formatCurrency(activity.cost) : 'Grátis'}</Text>
        </View>
    );

    // Formatação de Datas
    const formatDate = (dateISO) => {
        const date = new Date(dateISO);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pacote Gerado com Sucesso!</Text>
                    <Text style={styles.subtitle}>Sua viagem para {packageData.destino} está pronta.</Text>
                </View>

                {/* --- RESUMO GERAL --- */}
                <DetailCard title="Resumo da Viagem">
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Destino:</Text> {packageData.destino}
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Período:</Text> {formatDate(packageData.dateIn)} a {formatDate(packageData.dateOut)} ({packageData.numDays} dias)
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={{ fontWeight: 'bold' }}>Pessoas:</Text> {packageData.adults} Adultos e {packageData.children} Crianças
                    </Text>
                    <Text style={[styles.summaryText, styles.totalBudget]}>
                        <Text style={{ fontWeight: 'bold' }}>Orçamento Definido:</Text> {formatCurrency(packageData.orcamento)}
                    </Text>
                    <Text style={[styles.summaryText, styles.totalCost]}>
                        <Text style={{ fontWeight: 'bold' }}>Custo Total Estimado:</Text> {formatCurrency(packageData.totalCost)}
                    </Text>
                </DetailCard>

                {/* --- VOOS --- */}
                <DetailCard title="Voos Selecionados">
                    {packageData.flights && packageData.flights.length > 0 ? (
                        packageData.flights.map(renderFlight)
                    ) : (
                        <Text style={styles.noDataText}>Voos não incluídos no pacote.</Text>
                    )}
                </DetailCard>

                {/* --- HOSPEDAGEM --- */}
                <DetailCard title="Opção de Hospedagem">
                    {packageData.hotel ? (
                        renderHotel(packageData.hotel)
                    ) : (
                        <Text style={styles.noDataText}>Hospedagem não incluída ou indefinida.</Text>
                    )}
                </DetailCard>
                
                {/* --- ATIVIDADES (ROTEIRO) --- */}
                <DetailCard title="Roteiro de Atividades">
                    {packageData.activities && packageData.activities.length > 0 ? (
                        packageData.activities.map(renderActivity)
                    ) : (
                        <Text style={styles.noDataText}>Nenhuma atividade sugerida.</Text>
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
                        onPress={() => navigation.navigate('TravelBudget')}
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
