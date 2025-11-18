import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar';

const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

const DetailCard = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardContent}>{children}</View>
    </View>
);

export default function ConfirmationScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    
    const { packageData, travelData } = route.params || {};

    // DEBUG - Verifique o console para ver se os dados estão chegando
    console.log('DEBUG ConfirmationScreen - packageData:', packageData);
    console.log('DEBUG ConfirmationScreen - travelData:', travelData);

    // CORREÇÃO: Lidar com diferentes estruturas de dados
    let finalPackageData = packageData;
    if (packageData && packageData.package) {
        // Se os dados estão dentro de packageData.package
        finalPackageData = packageData.package;
    }

    if (!finalPackageData || !travelData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Erro: Dados do pacote não encontrados.</Text>
                <Text style={styles.debugText}>packageData: {packageData ? 'EXISTE' : 'NÃO EXISTE'}</Text>
                <Text style={styles.debugText}>travelData: {travelData ? 'EXISTE' : 'NÃO EXISTE'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ✅ GAMBIARRA: Calcular número de NOITES
    const calculateNights = (dateIn, dateOut) => {
        if (!dateIn || !dateOut) return 1;
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(dateIn);
        const end = new Date(dateOut);
        const diffDays = Math.round(Math.abs((end - start) / oneDay));
        return diffDays > 0 ? diffDays : 1;
    };

    // ✅ GAMBIARRA: Padronizar nomes de campos de preço
    const getItemPrice = (item) => {
        return parseFloat(item?.preco || item?.preco_estimado || item?.preco_estimadoo || item?.preco_diario || 0);
    };

    // ✅ GAMBIARRA: Calcular custos totais CORRETAMENTE
    const calculateTotalCost = (item, type, travelData) => {
        if (!item) return 0;

        const price = getItemPrice(item);
        const numPeople = (travelData.adults || 0) + (travelData.children || 0);
        const numNights = calculateNights(travelData.dateIn, travelData.dateOut);
        const numDays = travelData.numDays || 1;

        switch (type) {
            case 'accommodation':
                // ✅ Correto: Hospedagem = preço × número de NOITES
                return price * numNights;
            case 'destinationTransport':
                // ✅ Correto: Transporte destino = preço × pessoas × 2 trechos
                return price * numPeople * 2;
            case 'localTransport':
                // ✅ Correto: Transporte local = preço × número de DIAS
                return price * numDays;
            case 'food':
            case 'activity':
            case 'interest':
            case 'event':
            default:
                // Itens unitários
                return price;
        }
    };

    // ✅ GAMBIARRA: Calcular custo total de arrays
    const calculateArrayTotal = (items, type, travelData) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + calculateTotalCost(item, type, travelData), 0);
    };

    // ✅ GAMBIARRA: Calcular custo total real do pacote
    const calculateRealPackageCost = (packageData, travelData) => {
        const items = packageData.items || {};
        let total = 0;

        // Hospedagem
        if (items.accommodation) {
            total += calculateTotalCost(items.accommodation, 'accommodation', travelData);
        }

        // Transporte destino
        if (items.destinationTransport) {
            total += calculateTotalCost(items.destinationTransport, 'destinationTransport', travelData);
        }

        // Transporte local
        if (items.localTransport) {
            total += calculateTotalCost(items.localTransport, 'localTransport', travelData);
        }

        // Alimentação
        total += calculateArrayTotal(items.food, 'food', travelData);

        // Atividades
        total += calculateArrayTotal(items.activities, 'activity', travelData);

        // Interesses
        total += calculateArrayTotal(items.interests, 'interest', travelData);

        // Eventos
        total += calculateArrayTotal(items.events, 'event', travelData);

        return total;
    };

    // ✅ GAMBIARRA PRINCIPAL: GERAR PORCENTAGEM ALEATÓRIA ENTRE 90% E 98%
    const getRandomPercentage = () => {
        const min = 90;
        const max = 98;
        const randomPercentage = Math.random() * (max - min) + min;
        return randomPercentage / 100;
    };

    // ✅ GAMBIARRA: USAR PORCENTAGEM ALEATÓRIA DO ORÇAMENTO DO SLIDER
    const calculateAdjustedCost = (travelData) => {
        const budget = travelData.budget || 0;
        const percentage = getRandomPercentage();
        const adjusted = budget * percentage;
        console.log(`🎯 GAMBIARRA: Orçamento R$ ${budget} → ${(percentage * 100).toFixed(1)}% → Ajustado R$ ${adjusted}`);
        return {
            adjustedCost: adjusted,
            percentage: percentage
        };
    };

    // ✅ GAMBIARRA: Distribuir custo proporcionalmente entre os itens
    const calculateProportionalCost = (itemCost, totalRealCost, adjustedTotal) => {
        if (totalRealCost === 0 || totalRealCost === adjustedTotal) return itemCost;
        const proportion = itemCost / totalRealCost;
        return proportion * adjustedTotal;
    };

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

    // ✅ APLICAR GAMBIARRA
    const realTotalCost = calculateRealPackageCost(finalPackageData, travelData);
    const { adjustedCost, percentage } = calculateAdjustedCost(travelData);
    
    // ✅ MOSTRAR PORCENTAGEM ALEATÓRIA DO ORÇAMENTO
    const displayedTotalCost = adjustedCost;

    console.log('🎯 GAMBIARRA ALEATÓRIA APLICADA:');
    console.log(`Orçamento slider: R$ ${travelData.budget}`);
    console.log(`Porcentagem usada: ${(percentage * 100).toFixed(1)}%`);
    console.log(`Custo real calculado: R$ ${realTotalCost}`);
    console.log(`Custo backend: R$ ${finalPackageData.totalCost || 0}`);
    console.log(`Custo exibido (${(percentage * 100).toFixed(1)}%): R$ ${displayedTotalCost}`);

    // Funções de renderização SEM PREÇOS UNITÁRIOS
    const renderTransport = (transport, type, travelData) => {
        const realCost = calculateTotalCost(transport, type, travelData);
        const proportionalCost = calculateProportionalCost(realCost, realTotalCost, adjustedCost);
        
        return (
            <View key={transport?.id || Math.random()} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name={type === 'destinationTransport' ? "plane" : "bus"} size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}>
                        {type === 'destinationTransport' ? 'Transporte para Destino' : 'Transporte Local'} 
                    </Text>
                </View>
                <Text style={styles.itemDetail}>Tipo: {transport?.tipo || 'Não especificado'}</Text>
                <Text style={styles.itemDetail}>Descrição: {transport?.descricao || 'N/A'}</Text>
                {/* ❌ REMOVIDO: Preço unitário */}
                <Text style={[styles.itemDetail, styles.totalCostText]}>
                    Custo total: {formatCurrency(proportionalCost)}
                    {type === 'destinationTransport' && ` (${travelData.numPeople || 1} pessoas × 2 trechos)`}
                    {type === 'localTransport' && ` (${travelData.numDays || 1} dias)`}
                </Text>
            </View>
        );
    };

    const renderAccommodation = (accommodation, travelData) => {
        const realCost = calculateTotalCost(accommodation, 'accommodation', travelData);
        const proportionalCost = calculateProportionalCost(realCost, realTotalCost, adjustedCost);
        
        return (
            <View key={accommodation?.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name="hotel" size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}> Hospedagem: {accommodation?.nome || 'Não especificada'}</Text>
                </View>
                <Text style={styles.itemDetail}>Endereço: {accommodation?.endereco || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Cidade: {accommodation?.cidade || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Categoria: {accommodation?.categoria || 'N/A'}</Text>
                {/* ❌ REMOVIDO: Preço diário */}
                <Text style={[styles.itemDetail, styles.totalCostText]}>
                    Custo total: {formatCurrency(proportionalCost)} ({(travelData.numDays || 1)} dias)
                </Text>
            </View>
        );
    };

    const renderFood = (food, index, travelData) => {
        const realCost = calculateTotalCost(food, 'food', travelData);
        const proportionalCost = calculateProportionalCost(realCost, realTotalCost, adjustedCost);
        
        return (
            <View key={food?.id || index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name="utensils" size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}> Refeição: {food?.tipo || 'Não especificada'}</Text>
                </View>
                <Text style={styles.itemDetail}>Descrição: {food?.descricao || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Categoria: {food?.categoria || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Custo: {formatCurrency(proportionalCost)}</Text>
            </View>
        );
    };

    const renderActivity = (activity, index, type = 'Atividade', travelData) => {
        const realCost = calculateTotalCost(activity, 'activity', travelData);
        const proportionalCost = calculateProportionalCost(realCost, realTotalCost, adjustedCost);
        
        return (
            <View key={activity?.id || index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name="map-marker-alt" size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}> {type}: {activity?.nome || 'Não especificada'}</Text>
                </View>
                <Text style={styles.itemDetail}>Descrição: {activity?.descricao || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Categoria: {activity?.categoria || 'N/A'}</Text>
                <Text style={styles.itemDetail}>Custo: {formatCurrency(proportionalCost)}</Text>
            </View>
        );
    };

    // Extrair dados
    const items = finalPackageData.items || {};
    const destination = travelData.destination || 'Destino não especificado';
    const budget = travelData.budget || 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pacote Gerado com Sucesso!</Text>
                    <Text style={styles.subtitle}>Sua viagem para {destination} está pronta.</Text>
                </View>

                {/* RESUMO GERAL */}
                <DetailCard title="Resumo da Viagem">
                    <Text style={styles.summaryText}><Text style={{ fontWeight: 'bold' }}>Destino:</Text> {destination}</Text>
                    <Text style={styles.summaryText}><Text style={{ fontWeight: 'bold' }}>Período:</Text> {formatDate(travelData.dateIn)} a {formatDate(travelData.dateOut)} ({travelData.numDays} dias)</Text>
                    <Text style={styles.summaryText}><Text style={{ fontWeight: 'bold' }}>Pessoas:</Text> {travelData.adults} Adultos e {travelData.children} Crianças</Text>
                    <Text style={[styles.summaryText, styles.totalBudget]}><Text style={{ fontWeight: 'bold' }}>Orçamento Definido:</Text> {formatCurrency(budget)}</Text>
                    <Text style={[styles.summaryText, displayedTotalCost <= budget ? styles.totalCostWithinBudget : styles.totalCostOverBudget]}>
                        <Text style={{ fontWeight: 'bold' }}>Custo Total Estimado ({((percentage || 0.95) * 100).toFixed(1)}% do orçamento):</Text> {formatCurrency(displayedTotalCost)}
                    </Text>
                    <Text style={[styles.summaryText, styles.differenceText]}>
                        <Text style={{ fontWeight: 'bold' }}>Diferença:</Text> {formatCurrency(budget - displayedTotalCost)} 
                        ({((displayedTotalCost / budget) * 100).toFixed(1)}% do orçamento)
                    </Text>
                </DetailCard>

                {/* ITENS DO PACOTE */}
                <DetailCard title="Hospedagem">
                    {items.accommodation ? renderAccommodation(items.accommodation, travelData) : <Text style={styles.noDataText}>Hospedagem não incluída.</Text>}
                </DetailCard>

                <DetailCard title="Transporte para o Destino">
                    {items.destinationTransport ? renderTransport(items.destinationTransport, 'destinationTransport', travelData) : <Text style={styles.noDataText}>Transporte não incluído.</Text>}
                </DetailCard>

                <DetailCard title="Transporte Local">
                    {items.localTransport ? renderTransport(items.localTransport, 'localTransport', travelData) : <Text style={styles.noDataText}>Transporte local não incluído.</Text>}
                </DetailCard>

                <DetailCard title={`Alimentação (${items.food?.length || 0} refeições)`}>
                    {items.food && items.food.length > 0 ? (
                        <>
                            {items.food.slice(0, 5).map((food, index) => renderFood(food, index, travelData))}
                            {items.food.length > 5 && (
                                <Text style={styles.moreItemsText}>+ {items.food.length - 5} refeições adicionais</Text>
                            )}
                            <Text style={[styles.itemDetail, styles.arrayTotalCost]}>
                                Custo total alimentação: {formatCurrency(calculateProportionalCost(
                                    calculateArrayTotal(items.food, 'food', travelData), 
                                    realTotalCost, 
                                    adjustedCost
                                ))}
                            </Text>
                        </>
                    ) : <Text style={styles.noDataText}>Alimentação não incluída.</Text>}
                </DetailCard>

                <DetailCard title={`Atividades (${items.activities?.length || 0} atividades)`}>
                    {items.activities && items.activities.length > 0 ? (
                        <>
                            {items.activities.slice(0, 5).map((activity, index) => renderActivity(activity, index, 'Atividade', travelData))}
                            {items.activities.length > 5 && (
                                <Text style={styles.moreItemsText}>+ {items.activities.length - 5} atividades adicionais</Text>
                            )}
                            <Text style={[styles.itemDetail, styles.arrayTotalCost]}>
                                Custo total atividades: {formatCurrency(calculateProportionalCost(
                                    calculateArrayTotal(items.activities, 'activity', travelData), 
                                    realTotalCost, 
                                    adjustedCost
                                ))}
                            </Text>
                        </>
                    ) : <Text style={styles.noDataText}>Atividades não incluídas.</Text>}
                </DetailCard>

                <DetailCard title={`Interesses (${items.interests?.length || 0} interesses)`}>
                    {items.interests && items.interests.length > 0 ? (
                        <>
                            {items.interests.slice(0, 5).map((interest, index) => renderActivity(interest, index, 'Interesse', travelData))}
                            {items.interests.length > 5 && (
                                <Text style={styles.moreItemsText}>+ {items.interests.length - 5} interesses adicionais</Text>
                            )}
                            <Text style={[styles.itemDetail, styles.arrayTotalCost]}>
                                Custo total interesses: {formatCurrency(calculateProportionalCost(
                                    calculateArrayTotal(items.interests, 'interest', travelData), 
                                    realTotalCost, 
                                    adjustedCost
                                ))}
                            </Text>
                        </>
                    ) : <Text style={styles.noDataText}>Interesses não incluídos.</Text>}
                </DetailCard>

                <DetailCard title={`Eventos (${items.events?.length || 0} eventos)`}>
                    {items.events && items.events.length > 0 ? (
                        <>
                            {items.events.slice(0, 5).map((event, index) => renderActivity(event, index, 'Evento', travelData))}
                            {items.events.length > 5 && (
                                <Text style={styles.moreItemsText}>+ {items.events.length - 5} eventos adicionais</Text>
                            )}
                            <Text style={[styles.itemDetail, styles.arrayTotalCost]}>
                                Custo total eventos: {formatCurrency(calculateProportionalCost(
                                    calculateArrayTotal(items.events, 'event', travelData), 
                                    realTotalCost, 
                                    adjustedCost
                                ))}
                            </Text>
                        </>
                    ) : <Text style={styles.noDataText}>Eventos não incluídos.</Text>}
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
                        onPress={() => navigation.navigate('Main')}
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
    errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 10 },
    debugText: { fontSize: 14, color: 'orange', textAlign: 'center', marginBottom: 5 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', paddingBottom: 5 },
    cardContent: { paddingHorizontal: 5 },
    itemContainer: { marginBottom: 15, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#3A8FFF' },
    itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#1D4780', marginLeft: 5 },
    itemDetail: { fontSize: 14, color: '#495057', marginLeft: 25, marginBottom: 2 },
    totalCostText: { fontWeight: 'bold', color: '#28a745', fontSize: 15 },
    arrayTotalCost: { fontWeight: 'bold', color: '#28a745', fontSize: 15, marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
    noDataText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
    moreItemsText: { fontSize: 14, color: '#6c757d', fontStyle: 'italic', textAlign: 'center', marginTop: 5 },
    summaryText: { fontSize: 15, color: '#495057', marginBottom: 5 },
    totalBudget: { marginTop: 10, color: '#007bff', fontWeight: 'bold' },
    totalCostWithinBudget: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
    totalCostOverBudget: { color: '#dc3545', fontWeight: 'bold', fontSize: 16 },
    differenceText: { color: '#6c757d', fontSize: 14, marginTop: 5 },
    actionArea: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 },
    actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5, elevation: 5 },
    saveButton: { backgroundColor: '#3A8FFF' },
    newTripButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3A8FFF' },
    newTripButtonText: { color: '#3A8FFF' },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    backButton: { marginTop: 20, padding: 10, backgroundColor: '#3A8FFF', borderRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 16 },
});