import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Keyboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar';

const { height: screenHeight } = Dimensions.get('window');
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
    const [finalPackageData, setFinalPackageData] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentType, setCurrentType] = useState('');
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [packageName, setPackageName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    // DEBUG
    useEffect(() => {
        console.log('DEBUG ConfirmationScreen - packageData:', packageData);
        console.log('DEBUG ConfirmationScreen - travelData:', travelData);

        let data = packageData;
        if (packageData && packageData.package) {
            data = packageData.package;
        }
        setFinalPackageData(data);
    }, [packageData]);

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
                return price * numNights;
            case 'destinationTransport':
                return price * numPeople * 2;
            case 'localTransport':
                return price * numDays;
            case 'food':
            case 'activity':
            case 'interest':
            case 'event':
            default:
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
        const items = packageData?.items || {};
        let total = 0;

        if (items.accommodation) total += calculateTotalCost(items.accommodation, 'accommodation', travelData);
        if (items.destinationTransport) total += calculateTotalCost(items.destinationTransport, 'destinationTransport', travelData);
        if (items.localTransport) total += calculateTotalCost(items.localTransport, 'localTransport', travelData);
        total += calculateArrayTotal(items.food, 'food', travelData);
        total += calculateArrayTotal(items.activities, 'activity', travelData);
        total += calculateArrayTotal(items.interests, 'interest', travelData);
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

    // ✅ FUNÇÃO PARA BUSCAR ALTERNATIVAS (MOCK - substitua pela real depois)
    const fetchAlternatives = async (item, type) => {
        console.log('🔘 BOTÃO CLICADO - Item:', item, 'Tipo:', type);
        
        try {
            // Simulando busca de alternativas - você vai integrar com sua API
            const mockAlternatives = {
                accommodation: [
                    { id: 'acc-1', nome: 'Hotel Premium 5 Estrelas', endereco: 'Av. Principal, 500 - Centro', cidade: travelData.destination, categoria: 'Luxo', preco_diario: 300, descricao: 'Hotel 5 estrelas com piscina, spa, restaurante gourmet e serviço de quarto 24h. Localizado no coração da cidade com vista panorâmica.' },
                    { id: 'acc-2', nome: 'Pousada Charmosa', endereco: 'Rua das Flores, 123 - Centro Histórico', cidade: travelData.destination, categoria: 'Conforto', preco_diario: 120, descricao: 'Pousada familiar com arquitetura colonial, café da manhã caseiro incluído e ambiente aconchegante próximo às atrações turísticas.' },
                    { id: 'acc-3', nome: 'Resort All Inclusive', endereco: 'Praia do Sol, 1000 - Litoral', cidade: travelData.destination, categoria: 'Luxo', preco_diario: 450, descricao: 'Resort à beira-mar com sistema all inclusive, atividades recreativas, spa e diversas opções gastronômicas.' },
                    { id: 'acc-4', nome: 'Apartamento Moderno', endereco: 'Rua Moderna, 456 - Bairro Novo', cidade: travelData.destination, categoria: 'Conforto', preco_diario: 180, descricao: 'Apartamento totalmente mobiliado com 2 quartos, cozinha equipada, Wi-Fi e garagem. Ideal para famílias.' },
                    { id: 'acc-5', nome: 'Hostel Econômico', endereco: 'Travessa Jovem, 789 - Centro', cidade: travelData.destination, categoria: 'Econômico', preco_diario: 60, descricao: 'Hostel com quartos compartilhados e privativos, cozinha coletiva, área de convivência e localização central.' },
                ],
                destinationTransport: [
                    { id: 'trans-1', tipo: 'Avião Executivo', descricao: 'Voo direto classe executiva com bagagem despachada, refeição a bordo e assentos amplos com maior espaço para as pernas. Horários flexíveis.', preco: 600 },
                    { id: 'trans-2', tipo: 'Avião Econômico', descricao: 'Voo com escala classe econômica, incluindo bagagem de mão. Opção mais acessível com horários pré-definidos.', preco: 350 },
                    { id: 'trans-3', tipo: 'Ônibus Leito', descricao: 'Ônibus executivo com poltronas leito reclináveis, ar condicionado, Wi-Fi e serviço de bordo. Viagem noturna confortável.', preco: 180 },
                    { id: 'trans-4', tipo: 'Carro Particular', descricao: 'Viagem de carro particular com total flexibilidade de horários. Inclui pedágios e estacionamentos. Ideal para famílias.', preco: 250 },
                ],
                localTransport: [
                    { id: 'local-1', tipo: 'Carro Executivo', descricao: 'Carro premium com seguro completo, ar condicionado, GPS e 200km diários incluídos. Modelos recentes e confortáveis.', preco_diario: 120 },
                    { id: 'local-2', tipo: 'Carro Econômico', descricao: 'Carro compacto com seguro básico e 150km diários. Econômico no consumo de combustível. Ideal para cidade.', preco_diario: 60 },
                    { id: 'local-3', tipo: 'Transporte Público', descricao: 'Passe de ônibus/metrô ilimitado por dia. Acesso a todas as linhas da cidade. Opção mais econômica e sustentável.', preco_diario: 15 },
                    { id: 'local-4', tipo: 'Aplicativo de Transporte', descricao: 'Crédito diário para uso em aplicativos de transporte. Flexibilidade para vários trajetos ao longo do dia.', preco_diario: 40 },
                ],
                food: [
                    { id: 'food-1', tipo: 'Restaurante Gourmet', descricao: 'Experiência gastronômica premium em restaurante renomado. Pratos sofisticados com ingredientes selecionados e ambiente refinado.', categoria: 'Gourmet', preco: 120 },
                    { id: 'food-2', tipo: 'Restaurante Familiar', descricao: 'Culinária local de qualidade em ambiente descontraído. Pratos tradicionais da região, porções generosas e bom custo-benefício.', categoria: 'Médio', preco: 60 },
                    { id: 'food-3', tipo: 'Comida Rápida', descricao: 'Opções práticas e acessíveis para refeições rápidas. Inclui redes de fast-food e lanchonetes locais. Ideal para dias corridos.', categoria: 'Econômico', preco: 25 },
                    { id: 'food-4', tipo: 'Culinária Local', descricao: 'Restaurantes típicos com pratos tradicionais da região. Experiência autêntica da cultura gastronômica local.', categoria: 'Tradicional', preco: 45 },
                ],
                activity: [
                    { id: 'act-1', nome: 'Passeio Guiado Premium', descricao: 'Tour exclusivo com guia especializado em pequenos grupos. Inclui transporte privativo, ingressos e experiências exclusivas.', categoria: 'Premium', preco: 150 },
                    { id: 'act-2', nome: 'Atividade Regular', descricao: 'Experiência padrão com guia local em grupos médios. Inclui ingressos para as principais atrações e transporte compartilhado.', categoria: 'Regular', preco: 70 },
                    { id: 'act-3', nome: 'Atividade Econômica', descricao: 'Opção mais acessível para conhecer as atrações. Inclui ingressos básicos e informações para visitação independente.', categoria: 'Econômico', preco: 30 },
                    { id: 'act-4', nome: 'Aventura Radical', descricao: 'Experiências de aventura como trilhas, esportes radicais ou atividades na natureza. Inclui equipamentos e instrutores.', categoria: 'Aventura', preco: 90 },
                ],
                interest: [
                    { id: 'int-1', nome: 'Interesse VIP', descricao: 'Acesso VIP e experiência exclusiva com visitas privativas, horários diferenciados e atendimento personalizado.', categoria: 'VIP', preco: 200 },
                    { id: 'int-2', nome: 'Interesse Regular', descricao: 'Experiência padrão com acesso às principais atrações relacionadas ao seu interesse. Inclui ingressos e informações.', categoria: 'Regular', preco: 80 },
                    { id: 'int-3', nome: 'Interesse Básico', descricao: 'Opção essencial para conhecer os pontos relacionados ao seu interesse. Acesso básico às atrações principais.', categoria: 'Básico', preco: 25 },
                    { id: 'int-4', nome: 'Interesse Cultural', descricao: 'Foco em experiências culturais como museus, galerias de arte, apresentações folclóricas e eventos culturais locais.', categoria: 'Cultural', preco: 60 },
                ],
                event: [
                    { id: 'evt-1', nome: 'Evento VIP', descricao: 'Acesso VIP ao evento com camarote, estacionamento, open bar e comodidades exclusivas. Experiência premium.', categoria: 'VIP', preco: 300 },
                    { id: 'evt-2', nome: 'Evento Regular', descricao: 'Ingresso padrão para o evento com acesso a todas as áreas comuns. Boa visibilidade e experiência completa.', categoria: 'Regular', preco: 120 },
                    { id: 'evt-3', nome: 'Evento Popular', descricao: 'Ingresso popular com acesso às áreas gerais. Opção mais acessível para aproveitar o evento.', categoria: 'Popular', preco: 50 },
                    { id: 'evt-4', nome: 'Evento Familiar', descricao: 'Eventos focados em entretenimento familiar com atividades para crianças e preços especiais para famílias.', categoria: 'Familiar', preco: 80 },
                ]
            };

            setAlternatives(mockAlternatives[type] || []);
            setSelectedItem(item);
            setCurrentType(type);
            setModalVisible(true);

        } catch (error) {
            console.error('Erro ao buscar alternativas:', error);
            Alert.alert('Erro', 'Não foi possível carregar as alternativas');
        }
    };

    // ✅ FUNÇÃO PARA TROCAR ITEM
    const replaceItem = (newItem) => {
        if (!finalPackageData || !selectedItem) return;

        const updatedData = { ...finalPackageData };
        
        if (currentType === 'accommodation') {
            updatedData.items.accommodation = newItem;
        } else if (currentType === 'destinationTransport') {
            updatedData.items.destinationTransport = newItem;
        } else if (currentType === 'localTransport') {
            updatedData.items.localTransport = newItem;
        } else if (['food', 'activities', 'interests', 'events'].includes(currentType)) {
            const index = updatedData.items[currentType]?.findIndex(item => item.id === selectedItem.id);
            if (index !== -1 && index !== undefined) {
                updatedData.items[currentType][index] = newItem;
            }
        }

        setFinalPackageData(updatedData);
        setModalVisible(false);
        Alert.alert('Sucesso', 'Item atualizado com sucesso!');
    };

    // ✅ FUNÇÃO PARA SALVAR PACOTE NO HISTÓRICO
    const savePackageToHistory = async () => {
        if (!packageName.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome para o pacote');
            return;
        }

        try {
            // Buscar histórico atual
            const existingHistory = await AsyncStorage.getItem('travelHistory');
            const historyArray = existingHistory ? JSON.parse(existingHistory) : [];

            // Buscar pacotes públicos atuais
            const existingPublicPackages = await AsyncStorage.getItem('publicPackages');
            const publicPackagesArray = existingPublicPackages ? JSON.parse(existingPublicPackages) : [];

            // Criar objeto do pacote
            const packageToSave = {
                id: Date.now().toString(), // ID único baseado no timestamp
                title: packageName.trim(),
                destination: travelData.destination,
                dateIn: travelData.dateIn,
                dateOut: travelData.dateOut,
                adults: travelData.adults,
                children: travelData.children,
                budget: travelData.budget,
                totalCost: displayedTotalCost,
                packageData: finalPackageData,
                travelData: travelData,
                isPublic: isPublic,
                createdAt: new Date().toISOString(),
                // Informações resumidas para exibição rápida
                summary: {
                    accommodation: items.accommodation?.nome || 'Não definida',
                    transport: items.destinationTransport?.tipo || 'Não definido',
                    activitiesCount: items.activities?.length || 0,
                    foodCount: items.food?.length || 0
                }
            };

            // Adicionar novo pacote ao início do array do histórico
            const updatedHistory = [packageToSave, ...historyArray];

            // Salvar no histórico do usuário
            await AsyncStorage.setItem('travelHistory', JSON.stringify(updatedHistory));
            
            // Se for público, adicionar também aos pacotes públicos
            if (isPublic) {
                const updatedPublicPackages = [packageToSave, ...publicPackagesArray];
                await AsyncStorage.setItem('publicPackages', JSON.stringify(updatedPublicPackages));
            }
            
            // Fechar modal e mostrar sucesso
            setSaveModalVisible(false);
            setPackageName('');
            setIsPublic(false);
            
            Alert.alert(
                'Sucesso!', 
                `Pacote "${packageName}" salvo ${isPublic ? 'publicamente' : 'no seu histórico'}!`,
                [
                    {
                        text: isPublic ? 'Ver Busca' : 'Ver Histórico',
                        onPress: () => navigation.navigate(isPublic ? 'Search' : 'Profile')
                    },
                    {
                        text: 'Continuar',
                        style: 'cancel'
                    }
                ]
            );

        } catch (error) {
            console.error('Erro ao salvar pacote:', error);
            Alert.alert('Erro', 'Não foi possível salvar o pacote');
        }
    };

    // ✅ COMPONENTE DE ITEM EDITÁVEL
    const EditableItem = ({ item, type, travelData, onEdit, isSingle = false }) => {
        const realCost = calculateTotalCost(item, type, travelData);
        const proportionalCost = calculateProportionalCost(realCost, realTotalCost, adjustedCost);

        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <FontAwesome5 name={getIconName(type)} size={16} color="#1D4780" />
                    <Text style={styles.itemTitle}>{getItemTitle(item, type)}</Text>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => onEdit(item, type)}
                    >
                        <FontAwesome5 name="edit" size={14} color="#fff" />
                        <Text style={styles.editButtonText}>Trocar</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.itemDetail}>Descrição: {item?.descricao || item?.endereco || item?.tipo || 'N/A'}</Text>
                {item?.categoria && <Text style={styles.itemDetail}>Categoria: {item.categoria}</Text>}
                {item?.cidade && <Text style={styles.itemDetail}>Cidade: {item.cidade}</Text>}
                <Text style={[styles.itemDetail, styles.totalCostText]}>
                    Custo total: {formatCurrency(proportionalCost)}
                    {type === 'destinationTransport' && ` (${travelData.numPeople || 1} pessoas × 2 trechos)`}
                    {type === 'localTransport' && ` (${travelData.numDays || 1} dias)`}
                    {type === 'accommodation' && ` (${travelData.numDays || 1} dias)`}
                </Text>
            </View>
        );
    };

    // ✅ FUNÇÕES AUXILIARES
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

    // ✅ MODAL DE ALTERNATIVAS
    const AlternativesModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Escolha uma alternativa</Text>
                        <Text style={styles.modalSubtitle}>Selecione uma opção para substituir o item atual</Text>
                    </View>
                    
                    <FlatList
                        data={alternatives}
                        keyExtractor={(item) => `${currentType}-${item.id}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.alternativeItem}
                                onPress={() => replaceItem(item)}
                            >
                                <Text style={styles.alternativeTitle}>{item.nome || item.tipo}</Text>
                                <Text style={styles.alternativeCategory}>Categoria: {item.categoria}</Text>
                                {item.endereco && <Text style={styles.alternativeAddress}>Local: {item.endereco}</Text>}
                                <Text style={styles.alternativeDescription}>
                                    {item.descricao}
                                </Text>
                            </TouchableOpacity>
                        )}
                        style={styles.alternativesList}
                        showsVerticalScrollIndicator={true}
                    />

                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // ✅ MODAL PARA INSERIR NOME DO PACOTE
    const SavePackageModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={saveModalVisible}
            onRequestClose={() => {
                setSaveModalVisible(false);
                setPackageName('');
                setIsPublic(false);
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.saveModalContent}>
                    <Text style={styles.saveModalTitle}>Salvar Pacote</Text>
                    <Text style={styles.saveModalSubtitle}>
                        Dê um nome para seu pacote de viagem para {travelData.destination}
                    </Text>
                    
                    <TextInput
                        style={styles.packageNameInput}
                        placeholder="Ex: Minha viagem para o Rio"
                        placeholderTextColor="#999"
                        value={packageName}
                        onChangeText={setPackageName}
                        autoFocus={true}
                        maxLength={50}
                        onSubmitEditing={Keyboard.dismiss} // ✅ CORREÇÃO: Evita recuo do teclado
                        blurOnSubmit={false} // ✅ CORREÇÃO: Mantém teclado aberto
                    />
                    
                    <Text style={styles.charCount}>
                        {packageName.length}/50 caracteres
                    </Text>

                    {/* ✅ CHECKBOX PARA PACOTE PÚBLICO */}
                    <TouchableOpacity 
                        style={styles.publicCheckboxContainer}
                        onPress={() => setIsPublic(!isPublic)}
                    >
                        <View style={[styles.checkbox, isPublic && styles.checkboxChecked]}>
                            {isPublic && <FontAwesome5 name="check" size={12} color="#fff" />}
                        </View>
                        <Text style={styles.publicCheckboxText}>
                            Tornar este pacote público
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.publicDescription}>
                        {isPublic 
                            ? '📢 Este pacote aparecerá para outros usuários na tela de Busca'
                            : '🔒 Este pacote ficará visível apenas para você no seu histórico'
                        }
                    </Text>

                    <View style={styles.saveModalButtons}>
                        <TouchableOpacity 
                            style={[styles.saveModalButton, styles.cancelSaveButton]}
                            onPress={() => {
                                setSaveModalVisible(false);
                                setPackageName('');
                                setIsPublic(false);
                            }}
                        >
                            <Text style={styles.cancelSaveButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.saveModalButton, styles.confirmSaveButton]}
                            onPress={savePackageToHistory}
                            disabled={!packageName.trim()}
                        >
                            <Text style={styles.confirmSaveButtonText}>
                                {isPublic ? 'Salvar Público' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (!finalPackageData || !travelData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Erro: Dados do pacote não encontrados.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const realTotalCost = calculateRealPackageCost(finalPackageData, travelData);
    const { adjustedCost, percentage } = calculateAdjustedCost(travelData);
    const displayedTotalCost = adjustedCost;

    const items = finalPackageData.items || {};
    const destination = travelData.destination || 'Destino não especificado';
    const budget = travelData.budget || 0;

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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pacote Personalizável</Text>
                    <Text style={styles.subtitle}>Sua viagem para {destination} - Edite os itens conforme preferir!</Text>
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
                </DetailCard>

                {/* ITENS EDITÁVEIS */}
                <DetailCard title="🏨 Hospedagem">
                    {items.accommodation ? (
                        <EditableItem 
                            item={items.accommodation} 
                            type="accommodation" 
                            travelData={travelData}
                            onEdit={fetchAlternatives}
                            isSingle={true}
                        />
                    ) : <Text style={styles.noDataText}>Hospedagem não incluída.</Text>}
                </DetailCard>

                <DetailCard title="✈️ Transporte para o Destino">
                    {items.destinationTransport ? (
                        <EditableItem 
                            item={items.destinationTransport} 
                            type="destinationTransport" 
                            travelData={travelData}
                            onEdit={fetchAlternatives}
                            isSingle={true}
                        />
                    ) : <Text style={styles.noDataText}>Transporte não incluído.</Text>}
                </DetailCard>

                <DetailCard title="🚗 Transporte Local">
                    {items.localTransport ? (
                        <EditableItem 
                            item={items.localTransport} 
                            type="localTransport" 
                            travelData={travelData}
                            onEdit={fetchAlternatives}
                            isSingle={true}
                        />
                    ) : <Text style={styles.noDataText}>Transporte local não incluído.</Text>}
                </DetailCard>

                <DetailCard title={`🍽️ Alimentação (${items.food?.length || 0} refeições)`}>
                    {items.food && items.food.length > 0 ? (
                        <>
                            {items.food.map((food, index) => (
                                <EditableItem 
                                    key={`food-${food?.id || index}`}
                                    item={food} 
                                    type="food" 
                                    travelData={travelData}
                                    onEdit={fetchAlternatives}
                                />
                            ))}
                        </>
                    ) : <Text style={styles.noDataText}>Alimentação não incluída.</Text>}
                </DetailCard>

                <DetailCard title={`🎯 Atividades (${items.activities?.length || 0} atividades)`}>
                    {items.activities && items.activities.length > 0 ? (
                        <>
                            {items.activities.map((activity, index) => (
                                <EditableItem 
                                    key={`activity-${activity?.id || index}`}
                                    item={activity} 
                                    type="activity" 
                                    travelData={travelData}
                                    onEdit={fetchAlternatives}
                                />
                            ))}
                        </>
                    ) : <Text style={styles.noDataText}>Atividades não incluídas.</Text>}
                </DetailCard>

                <DetailCard title={`❤️ Interesses (${items.interests?.length || 0} interesses)`}>
                    {items.interests && items.interests.length > 0 ? (
                        <>
                            {items.interests.map((interest, index) => (
                                <EditableItem 
                                    key={`interest-${interest?.id || index}`}
                                    item={interest} 
                                    type="interest" 
                                    travelData={travelData}
                                    onEdit={fetchAlternatives}
                                />
                            ))}
                        </>
                    ) : <Text style={styles.noDataText}>Interesses não incluídos.</Text>}
                </DetailCard>

                <DetailCard title={`🎪 Eventos (${items.events?.length || 0} eventos)`}>
                    {items.events && items.events.length > 0 ? (
                        <>
                            {items.events.map((event, index) => (
                                <EditableItem 
                                    key={`event-${event?.id || index}`}
                                    item={event} 
                                    type="event" 
                                    travelData={travelData}
                                    onEdit={fetchAlternatives}
                                />
                            ))}
                        </>
                    ) : <Text style={styles.noDataText}>Eventos não incluídos.</Text>}
                </DetailCard>

                {/* BOTÕES DE AÇÃO */}
                <View style={styles.actionArea}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={() => setSaveModalVisible(true)}
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

            <AlternativesModal />
            <SavePackageModal />
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
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 20, 
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
    editButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3A8FFF', 
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    editButtonText: { 
        color: '#fff', 
        fontSize: 12, 
        fontWeight: 'bold',
        marginLeft: 4
    },
    itemDetail: { 
        fontSize: 14, 
        color: '#495057', 
        marginLeft: 24, 
        marginBottom: 3 
    },
    totalCostText: { 
        fontWeight: 'bold', 
        color: '#28a745', 
        fontSize: 15,
        marginTop: 5 
    },
    noDataText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
    moreItemsText: { fontSize: 14, color: '#6c757d', fontStyle: 'italic', textAlign: 'center', marginTop: 5 },
    summaryText: { fontSize: 15, color: '#495057', marginBottom: 5 },
    totalBudget: { marginTop: 10, color: '#007bff', fontWeight: 'bold' },
    totalCostWithinBudget: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
    totalCostOverBudget: { color: '#dc3545', fontWeight: 'bold', fontSize: 16 },
    actionArea: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 },
    actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5, elevation: 5 },
    saveButton: { backgroundColor: '#3A8FFF' },
    newTripButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3A8FFF' },
    newTripButtonText: { color: '#3A8FFF' },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    backButton: { marginTop: 20, padding: 10, backgroundColor: '#3A8FFF', borderRadius: 8 },
    backButtonText: { color: '#fff', fontSize: 16 },
    // Modal styles - MAIOR E MAIS COMPRIDO
    modalContainer: { 
        flex: 1, 
        justifyContent: 'flex-end', // Muda para ficar na parte de baixo
        backgroundColor: 'rgba(0,0,0,0.7)' 
    },
    modalContent: { 
        backgroundColor: 'white', 
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25, 
        width: '100%', 
        height: screenHeight * 0.85, // 85% da tela - MUITO MAIOR
    },
    modalHeader: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 15,
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        textAlign: 'center',
        color: '#1D4780'
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    alternativesList: {
        flex: 1, // Ocupa todo o espaço disponível
        marginBottom: 15,
    },
    alternativeItem: { 
        padding: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e8e8e8', 
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#f8f9fa'
    },
    alternativeTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1D4780',
        marginBottom: 5,
    },
    alternativeCategory: {
        fontSize: 14,
        color: '#3A8FFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    alternativeAddress: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    alternativeDescription: { 
        fontSize: 14, 
        color: '#555', 
        lineHeight: 20,
    },
    closeButton: { 
        padding: 16, 
        backgroundColor: '#dc3545', 
        borderRadius: 12, 
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: { 
        color: 'white', 
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal de salvar pacote
    saveModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    saveModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1D4780',
        marginBottom: 10,
        textAlign: 'center',
    },
    saveModalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    packageNameInput: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#3A8FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        marginBottom: 20,
    },
    // Checkbox styles
    publicCheckboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        width: '100%',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#3A8FFF',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3A8FFF',
    },
    publicCheckboxText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    publicDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    saveModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    saveModalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelSaveButton: {
        backgroundColor: '#6c757d',
    },
    confirmSaveButton: {
        backgroundColor: '#3A8FFF',
    },
    cancelSaveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmSaveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});