import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ButtonClouds from '../components/ButtonClouds';
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
                            const existingHistory = await AsyncStorage.getItem('travelHistory');
                            let historyArray = existingHistory ? JSON.parse(existingHistory) : [];
                            historyArray = historyArray.filter(item => item.id !== travelPackage.id);
                            await AsyncStorage.setItem('travelHistory', JSON.stringify(historyArray));

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

    // ✅ NOVO COMPONENTE DE ITEM MODERNO
    const ReadOnlyItem = ({ item, type }) => {
        const getItemTitle = (item, type) => {
            const titles = {
                accommodation: `${item?.nome || 'Hospedagem'}`,
                destinationTransport: `${item?.tipo || 'Transporte'}`,
                localTransport: `${item?.tipo || 'Transporte Local'}`,
                food: `${item?.tipo || 'Refeição'}`,
                activity: `${item?.nome || 'Atividade'}`,
                interest: `${item?.nome || 'Interesse'}`,
                event: `${item?.nome || 'Evento'}`
            };
            return titles[type] || 'Item';
        };

        const getSubtitle = (item, type) => {
            switch(type) {
                case 'accommodation':
                    return item?.endereco || item?.cidade || 'Local não especificado';
                case 'destinationTransport':
                case 'localTransport':
                    return item?.descricao || 'Detalhes do transporte';
                case 'food':
                    return item?.descricao || 'Detalhes da refeição';
                default:
                    return item?.descricao || item?.categoria || 'Descrição não disponível';
            }
        };

        const getLocation = (item, type) => {
            if (item?.endereco) {
                return item.endereco;
            }
            if (item?.cidade) {
                return item.cidade;
            }
            if (item?.categoria) {
                return item.categoria;
            }
            return 'Localização';
        };

        return (
            <View style={styles.modernItemContainer}>
                <View style={styles.modernItemContent}>
                    <View style={styles.modernItemHeader}>
                        <Text style={styles.modernItemTitle}>
                            {getItemTitle(item, type)}
                        </Text>
                        <View style={styles.locationBadge}>
                            <FontAwesome5 name="map-marker-alt" size={10} color="#fff" />
                            <Text style={styles.locationText}>
                                {getLocation(item, type)}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={styles.modernItemSubtitle}>
                        {getSubtitle(item, type)}
                    </Text>
                    
                    <View style={styles.modernItemFooter}>
                        <Text style={styles.modernItemDates}>
                            20/12/24 até 27/12/24
                        </Text>
                        <Text style={styles.modernItemTotal}>
                           
                        </Text>
                    </View>
                </View>
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

                {/* ITENS DO PACOTE COM NOVO DESIGN */}
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
<ButtonClouds />
            // ✅ BOTÕES DE AÇÃO COM CONTAINER E NUVENS
<View style={styles.footerContainer}>
    {/* NUVENS NO FOOTER */}
    
    
    <View style={styles.footerContent}>
        <View style={styles.actionArea}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.travelAgainButton]}
                onPress={handleTravelAgain}
            >
                <FontAwesome5 name="redo" size={18} color="#fff" />
                <Text style={styles.buttonText}>Viajar Novamente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
            >
                <FontAwesome5 name="trash" size={18} color="#dc3545" />
                <Text style={[styles.buttonText, styles.deleteButtonText]}>Excluir Pacote</Text>
            </TouchableOpacity>
        </View>
    </View>
</View>
            </ScrollView> 
            <Navbar />
        </View>
    );
}     
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#3A8FFF',
        zIndex: 1,
        
    },
    scrollContent: { 
        paddingBottom: 50 // Mais espaço para o footer
    },
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
        marginBottom: 40, 
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
    cardContent: { 
        paddingHorizontal: 5 
    },
    
    // ESTILOS PARA OS ITENS MODERNOS
    modernItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    modernItemContent: {
        padding: 16,
    },
    modernItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    modernItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 10,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3A8FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    modernItemSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    modernItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    modernItemDates: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    modernItemTotal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#28a745',
    },
    
    noDataText: { 
        fontSize: 14, 
        color: '#999', 
        fontStyle: 'italic', 
        textAlign: 'center' 
    },
    summaryText: { 
        fontSize: 15, 
        color: '#495057', 
        marginBottom: 8, 
        lineHeight: 20 
    },
    summaryLabel: { 
        fontWeight: 'bold', 
        color: '#1D4780' 
    },
    totalCost: { 
        fontWeight: 'bold', 
        color: '#28a745', 
        fontSize: 16,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    
      footerContainer: {
        backgroundColor: '#ffffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        position: 'relative',
        zIndex: 3, // Conteúdo do footer na frente das nuvens
    },
    
    footerContent: {
        paddingHorizontal: 20,
        position: 'relative',
        zIndex: 10,
    },
     actionArea: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 12,
    },
    actionButton: { 
        flex: 1, 
        paddingVertical: 14,
        borderRadius: 10, 
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    travelAgainButton: { 
        backgroundColor: '#3A8FFF',
    },
    deleteButton: { 
        backgroundColor: '#fff', 
        borderWidth: 2, 
        borderColor: '#dc3545',
    },
        footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 5, // Footer na frente das nuvens
    },
    buttonText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#fff' 
    },
    deleteButtonText: { 
        color: '#dc3545',
        fontSize: 16,
        fontWeight: 'bold',
    },
});