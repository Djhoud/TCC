import { db } from '../database';

// Serviço para buscar alternativas do banco de dados
export const findAlternatives = async (
    type: string, 
    currentItem: any, 
    destination: string, 
    budget: number, 
    travelData: any
) => {
    try {
        console.log(`Buscando alternativas do tipo: ${type} para ${destination}`);
        
        // Lógica específica para cada tipo de item
        switch (type) {
            case 'accommodation':
                return await findAccommodationAlternatives(destination, budget, currentItem);
                
            case 'destinationTransport':
                return await findTransportAlternatives(destination, budget, currentItem, 'destination');
                
            case 'localTransport':
                return await findTransportAlternatives(destination, budget, currentItem, 'local');
                
            case 'food':
                return await findFoodAlternatives(destination, budget, currentItem);
                
            case 'activity':
                return await findActivityAlternatives(destination, budget, currentItem);
                
            default:
                return [];
        }
    } catch (error) {
        console.error('Erro no serviço de alternativas:', error);
        return [];
    }
};

// Buscar alternativas de hospedagem
const findAccommodationAlternatives = async (destination: string, budget: number, currentItem: any) => {
    try {
        const [alternatives]: any = await db.query(
            `SELECT id, nome, endereco, cidade, categoria, preco_diario as preco 
             FROM hospedagens 
             WHERE cidade = ? AND id != ? 
             ORDER BY ABS(preco_diario - ?) 
             LIMIT 5`,
            [destination, currentItem?.id || 0, currentItem?.preco || budget * 0.3]
        );
        
        return alternatives || [];
    } catch (error) {
        console.error('Erro ao buscar hospedagens alternativas:', error);
        return [];
    }
};

// Buscar alternativas de transporte
const findTransportAlternatives = async (destination: string, budget: number, currentItem: any, transportType: string) => {
    try {
        const [alternatives]: any = await db.query(
            `SELECT id, tipo, descricao, preco 
             FROM transportes 
             WHERE destino = ? AND tipo_transporte = ? AND id != ?
             ORDER BY ABS(preco - ?) 
             LIMIT 5`,
            [destination, transportType, currentItem?.id || 0, currentItem?.preco || budget * 0.2]
        );
        
        return alternatives || [];
    } catch (error) {
        console.error('Erro ao buscar transportes alternativos:', error);
        return [];
    }
};

// Buscar alternativas de alimentação
const findFoodAlternatives = async (destination: string, budget: number, currentItem: any) => {
    try {
        const [alternatives]: any = await db.query(
            `SELECT id, tipo, descricao, categoria, preco 
             FROM alimentacao 
             WHERE destino = ? AND id != ?
             ORDER BY ABS(preco - ?) 
             LIMIT 5`,
            [destination, currentItem?.id || 0, currentItem?.preco || budget * 0.1]
        );
        
        return alternatives || [];
    } catch (error) {
        console.error('Erro ao buscar alimentação alternativa:', error);
        return [];
    }
};

// Buscar alternativas de atividades
const findActivityAlternatives = async (destination: string, budget: number, currentItem: any) => {
    try {
        const [alternatives]: any = await db.query(
            `SELECT id, nome, descricao, categoria, preco 
             FROM atividades 
             WHERE destino = ? AND id != ?
             ORDER BY ABS(preco - ?) 
             LIMIT 5`,
            [destination, currentItem?.id || 0, currentItem?.preco || budget * 0.15]
        );
        
        return alternatives || [];
    } catch (error) {
        console.error('Erro ao buscar atividades alternativas:', error);
        return [];
    }
};