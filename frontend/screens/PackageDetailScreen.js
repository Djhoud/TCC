import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function PackageDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    
    // ✅ VERIFICAÇÃO DE SEGURANÇA - IMPORTANTE!
    if (!route.params?.package) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Pacote não encontrado.</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    const { package: travelPackage } = route.params;

    // ✅ VERIFICAÇÃO ADICIONAL DA ESTRUTURA DO PACOTE
    if (!travelPackage || !travelPackage.id) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Dados do pacote inválidos.</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

    // ... resto do código permanece igual
    const getDefaultImage = (destination) => {
        const images = {
            'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
            'São Paulo': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c',
            'Salvador': 'https://images.unsplash.com/photo-1541336032412-2048a678540d',
            'Florianópolis': 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f',
            'Gramado': 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd',
            'Fortaleza': 'https://images.unsplash.com/photo-1551524164-6ca5e3aa1c04',
            'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'
        };
        
        const normalizedDest = destination?.toLowerCase();
        for (const [key, value] of Object.entries(images)) {
            if (normalizedDest?.includes(key.toLowerCase())) {
                return value;
            }
        }
        return images.default;
    };

    // ✅ VIAJAR NOVAMENTE
    const handleTravelAgain = () => {
        Alert.alert(
            'Viajar Novamente',
            'Deseja criar um novo pacote com os mesmos dados desta viagem?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Criar Novo Pacote',
                    onPress: () => {
                        navigation.navigate('Confirmation', {
                            packageData: { package: travelPackage.packageData },
                            travelData: travelPackage.travelData
                        });
                    }
                }
            ]
        );
    };

    // ✅ EXCLUIR PACOTE
    const handleDelete = async () => {
        Alert.alert(
            'Excluir Pacote',
            `Tem certeza que deseja excluir o pacote "${travelPackage.title}"? Esta ação não pode ser desfeita.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remover do histórico
                            const existingHistory = await AsyncStorage.getItem('travelHistory');
                            let historyArray = existingHistory ? JSON.parse(existingHistory) : [];
                            historyArray = historyArray.filter(item => item.id !== travelPackage.id);
                            await AsyncStorage.setItem('travelHistory', JSON.stringify(historyArray));

                            // Se for público, remover também dos públicos
                            if (travelPackage.isPublic) {
                                const existingPublic = await AsyncStorage.getItem('publicPackages');
                                let publicArray = existingPublic ? JSON.parse(existingPublic) : [];
                                publicArray = publicArray.filter(item => item.id !== travelPackage.id);
                                await AsyncStorage.setItem('publicPackages', JSON.stringify(publicArray));
                            }

                            Alert.alert('Sucesso', 'Pacote excluído com sucesso!');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Erro ao excluir pacote:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o pacote');
                        }
                    }
                }
            ]
        );
    };

    // ✅ COMPONENTE DE ITEM (somente leitura)
    const ReadOnlyItem = ({ item, type }) => {
        const getIconName = (type) => {
            const icons = {
                accommodation: "hotel",
                destinationTransport: "plane",
                localTransport: "bus",
                food: "utensils",
                activity: "map-marker-alt",
                interest: "heart",
                event: "calendar"
            };
            return icons[type] || "map-marker-alt";
        };

        const getItemTitle = (item, type) => {
            const titles = {
                accommodation: `Hospedagem: ${item?.nome || 'Não especificada'}`,
                destinationTransport: `Transporte: ${item?.tipo || 'Para Destino'}`,
                localTransport: `Transporte: ${item?.tipo || 'Local'}`,
                food: `Refeição: ${item?.tipo || 'Não especificada'}`,
                activity: `Atividade: ${item?.nome || 'Não especificada'}`,
                interest: `Interesse: ${item?.nome || 'Não especificada'}`,
                event: `Evento: ${item?.nome || 'Não especificada'}`
            };
            return titles[type] || 'Item';
        };

        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name={getIconName(type)} size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}>{getItemTitle(item, type)}</Text>
                </View>
                <Text style={styles.itemDetail}>Descrição: {item?.descricao || item?.endereco || item?.tipo || 'N/A'}</Text>
                {item?.categoria && <Text style={styles.itemDetail}>Categoria: {item.categoria}</Text>}
                {item?.cidade && <Text style={styles.itemDetail}>Cidade: {item.cidade}</Text>}
                {item?.preco_diario && (
                    <Text style={styles.itemDetail}>
                        Preço diário: {formatCurrency(item.preco_diario)}
                    </Text>
                )}
                {item?.preco && (
                    <Text style={styles.itemDetail}>
                        Preço: {formatCurrency(item.preco)}
                    </Text>
                )}
            </View>
        );
    };

    const items = travelPackage.packageData?.items || {};
    const imageUrl = getDefaultImage(travelPackage.destination);
    const days = Math.ceil((new Date(travelPackage.dateOut) - new Date(travelPackage.dateIn)) / (1000 * 60 * 60 * 24)) || 1;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* HEADER COM IMAGEM */}
                <View style={styles.header}>
                    <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.headerImage}
                        defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828' }}
                    />
                    <View style={styles.headerOverlay}>
                        <Text style={styles.title}>{travelPackage.title}</Text>
                        <Text style={styles.subtitle}>
                            <FontAwesome5 name="map-marker-alt" size={14} color="#fff" /> {travelPackage.destination}
                        </Text>
                        <View style={styles.headerBadges}>
                            <Text style={styles.badge}>
                                {days} dias
                            </Text>
                            {travelPackage.isPublic && (
                                <Text style={[styles.badge, styles.publicBadge]}>
                                    <FontAwesome5 name="globe-americas" size={10} color="#fff" /> Público
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* RESUMO GERAL */}
                <DetailCard title="📊 Resumo da Viagem">
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Destino:</Text> {travelPackage.destination}
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Período:</Text> {formatDate(travelPackage.dateIn)} a {formatDate(travelPackage.dateOut)}
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Duração:</Text> {days} dias
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Pessoas:</Text> {travelPackage.adults} Adultos e {travelPackage.children} Crianças
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Orçamento Definido:</Text> {formatCurrency(travelPackage.budget)}
                    </Text>
                    <Text style={[styles.summaryText, styles.totalCost]}>
                        <Text style={styles.summaryLabel}>Custo Total Estimado:</Text> {formatCurrency(travelPackage.totalCost)}
                    </Text>
                    <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Salvo em:</Text> {formatDate(travelPackage.createdAt)}
                    </Text>
                </DetailCard>

                {/* ITENS DO PACOTE */}
                <DetailCard title="🏨 Hospedagem">
                    {items.accommodation ? (
                        <ReadOnlyItem item={items.accommodation} type="accommodation" />
                    ) : <Text style={styles.noDataText}>Hospedagem não incluída.</Text>}
                </DetailCard>

                <DetailCard title="✈️ Transporte para o Destino">
                    {items.destinationTransport ? (
                        <ReadOnlyItem item={items.destinationTransport} type="destinationTransport" />
                    ) : <Text style={styles.noDataText}>Transporte não incluído.</Text>}
                </DetailCard>

                <DetailCard title="🚗 Transporte Local">
                    {items.localTransport ? (
                        <ReadOnlyItem item={items.localTransport} type="localTransport" />
                    ) : <Text style={styles.noDataText}>Transporte local não incluído.</Text>}
                </DetailCard>

                <DetailCard title={`🍽️ Alimentação (${items.food?.length || 0} refeições)`}>
                    {items.food && items.food.length > 0 ? (
                        items.food.map((food, index) => (
                            <ReadOnlyItem key={`food-${food?.id || index}`} item={food} type="food" />
                        ))
                    ) : <Text style={styles.noDataText}>Alimentação não incluída.</Text>}
                </DetailCard>

                <DetailCard title={`🎯 Atividades (${items.activities?.length || 0} atividades)`}>
                    {items.activities && items.activities.length > 0 ? (
                        items.activities.map((activity, index) => (
                            <ReadOnlyItem key={`activity-${activity?.id || index}`} item={activity} type="activity" />
                        ))
                    ) : <Text style={styles.noDataText}>Atividades não incluídas.</Text>}
                </DetailCard>

                <DetailCard title={`❤️ Interesses (${items.interests?.length || 0} interesses)`}>
                    {items.interests && items.interests.length > 0 ? (
                        items.interests.map((interest, index) => (
                            <ReadOnlyItem key={`interest-${interest?.id || index}`} item={interest} type="interest" />
                        ))
                    ) : <Text style={styles.noDataText}>Interesses não incluídos.</Text>}
                </DetailCard>

                <DetailCard title={`🎪 Eventos (${items.events?.length || 0} eventos)`}>
                    {items.events && items.events.length > 0 ? (
                        items.events.map((event, index) => (
                            <ReadOnlyItem key={`event-${event?.id || index}`} item={event} type="event" />
                        ))
                    ) : <Text style={styles.noDataText}>Eventos não incluídos.</Text>}
                </DetailCard>

                {/* BOTÕES DE AÇÃO */}
                <View style={styles.actionArea}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.travelAgainButton]}
                        onPress={handleTravelAgain}
                    >
                        <FontAwesome5 name="redo" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Viajar Novamente</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <FontAwesome5 name="trash" size={16} color="#dc3545" />
                        <Text style={[styles.buttonText, styles.deleteButtonText]}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7f9' },
    scrollContent: { paddingBottom: 100 },
    centerContent: { 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20 
    },
    errorText: { 
        fontSize: 18, 
        color: 'red', 
        textAlign: 'center', 
        marginBottom: 20 
    },
    backButton: { 
        padding: 15, 
        backgroundColor: '#3A8FFF', 
        borderRadius: 10 
    },
    backButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    header: {
        height: 200,
        position: 'relative',
        marginBottom: 20,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    headerBadges: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: '600',
    },
    publicBadge: {
        backgroundColor: 'rgba(58, 143, 255, 0.8)',
    },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 20, 
        marginHorizontal: 20,
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3 
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#343a40', 
        marginBottom: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f8f9fa', 
        paddingBottom: 5 
    },
    cardContent: { paddingHorizontal: 5 },
    itemContainer: { 
        marginBottom: 15, 
        padding: 15,
        backgroundColor: '#f8f9fa', 
        borderRadius: 10,
        borderLeftWidth: 4, 
        borderLeftColor: '#3A8FFF',
    },
    itemHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    itemTitle: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1D4780', 
        marginLeft: 8, 
        flex: 1 
    },
    itemDetail: { 
        fontSize: 14, 
        color: '#495057', 
        marginLeft: 24, 
        marginBottom: 3 
    },
    noDataText: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
    summaryText: { fontSize: 15, color: '#495057', marginBottom: 8, lineHeight: 20 },
    summaryLabel: { fontWeight: 'bold', color: '#1D4780' },
    totalCost: { 
        fontWeight: 'bold', 
        color: '#28a745', 
        fontSize: 16,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionArea: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 30, 
        marginBottom: 40,
        paddingHorizontal: 20,
        gap: 10,
    },
    actionButton: { 
        flex: 1, 
        paddingVertical: 15, 
        borderRadius: 10, 
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    travelAgainButton: { 
        backgroundColor: '#3A8FFF',
    },
    deleteButton: { 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#dc3545',
    },
    buttonText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#fff' 
    },
    deleteButtonText: { 
        color: '#dc3545' 
    },
});