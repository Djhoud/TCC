import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    } catch (error) {
        return 'Data inválida';
    }
};

export default function TravelCard({ travel, onPress }) {
    // Imagem padrão baseada no destino
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

    const imageUrl = travel.image || getDefaultImage(travel.destination);
    const days = Math.ceil((new Date(travel.dateOut) - new Date(travel.dateIn)) / (1000 * 60 * 60 * 24)) || 1;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image 
                source={{ uri: imageUrl }} 
                style={styles.cardImage}
                defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828' }}
            />
            
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {travel.title}
                    </Text>
                    {travel.isPublic && (
                        <FontAwesome5 name="globe-americas" size={14} color="#3A8FFF" />
                    )}
                </View>
                
                <Text style={styles.cardDestination}>
                    <FontAwesome5 name="map-marker-alt" size={12} color="#666" /> {travel.destination}
                </Text>
                
                <View style={styles.cardDetails}>
                    <Text style={styles.cardDate}>
                        <FontAwesome5 name="calendar" size={12} color="#888" /> 
                        {formatDate(travel.dateIn)} - {formatDate(travel.dateOut)}
                    </Text>
                    <Text style={styles.cardDays}>{days} dias</Text>
                </View>
                
                <View style={styles.cardFooter}>
                    <Text style={styles.cardBudget}>
                        {formatCurrency(travel.budget)}
                    </Text>
                    
                    <View style={styles.cardStats}>
                        {travel.summary?.accommodation && (
                            <Text style={styles.cardStat}>
                                🏨 {travel.summary.accommodation.split(' ')[0]}
                            </Text>
                        )}
                        {travel.summary?.activitiesCount > 0 && (
                            <Text style={styles.cardStat}>
                                🎯 {travel.summary.activitiesCount} ativ
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1D4780',
        flex: 1,
        marginRight: 8,
    },
    cardDestination: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardDate: {
        fontSize: 12,
        color: '#888',
        flex: 1,
    },
    cardDays: {
        fontSize: 12,
        color: '#3A8FFF',
        fontWeight: '600',
        backgroundColor: '#E8F2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    cardBudget: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
    },
    cardStats: {
        flexDirection: 'row',
        gap: 8,
    },
    cardStat: {
        fontSize: 10,
        color: '#666',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
});