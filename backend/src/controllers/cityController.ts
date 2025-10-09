import { Request, RequestHandler, Response } from 'express';
import * as cityService from '../services/cityService';

// Controller para buscar sugestões
export const getCitiesController = async (req: Request, res: Response) => {
    try {
        const searchText = req.query.search as string | undefined;
        const cities = await cityService.getCitySuggestions(searchText);
        res.json(cities);
    } catch (error) {
        console.error('Erro no controller de sugestões de cidades:', error);
        res.status(500).json({ message: 'Erro interno ao buscar sugestões.' });
    }
};

// NOVO CONTROLLER: Busca os detalhes da cidade, incluindo orçamento
export const getCityDetailsController: RequestHandler = async (req: Request, res: Response) => {
    const cityName = req.query.cityName as string;

    if (!cityName) {
        // CORRETO: Usa 'return' para sair da função imediatamente
        res.status(400).json({ message: 'O nome da cidade (cityName) é obrigatório.' });
        return;
    }

    try {
        const details = await cityService.getCityDetails(cityName);
        if (!details) {
            // CORRETO: Usa 'return' para sair da função imediatamente
            res.status(404).json({ message: 'Detalhes da cidade não encontrados.' });
            return;
        }
        // CORREÇÃO: Remova o 'return' da resposta final, pois o Express espera void.
        res.json(details); 
        
    } catch (error) {
        console.error('Erro no controller de detalhes da cidade:', error);
        
        // CORREÇÃO: Remova o 'return' (ou use 'return' se quiser garantir o encerramento)
        // Neste caso, 'return' é aceitável, pois é o caminho de erro e é o último passo.
        res.status(500).json({ message: 'Erro interno ao buscar detalhes da cidade.' });
        return;
    }
    
    // IMPORTANTE: Se o try/catch for executado sem erro, a função retorna implicitamente 'void'.
};  
    // IMPORTANTE: Se o try/catch for executado sem erro, a função retorna implicitamente 'void'.
