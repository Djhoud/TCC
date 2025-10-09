import { Request, RequestHandler, Response } from 'express';
import * as cityService from '../services/cityService';

// Controller para buscar sugestões de cidades (Autocomplete)
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
    // Parâmetros de Query String
    const cityName = req.query.cityName as string;
    
    // Torna 'dias' opcional para a primeira busca. 
    // Usamos 1 se não for enviado ou for inválido.
    let dias = parseInt(req.query.dias as string, 10); 
    if (isNaN(dias) || dias <= 0) {
        dias = 1; // Padrão: 1 dia (para retornar o custo diário estimado)
    }

    // Apenas o nome da cidade é obrigatório para a primeira busca de orçamento
    if (!cityName) {
        res.status(400).json({ message: 'O nome da cidade é obrigatório.' });
        return;
    }

    try {
        // Passa o nome da cidade E o número de dias (1 ou o valor real)
        const details = await cityService.getCityDetails(cityName, dias);

        if (!details) {
            res.status(404).json({ message: 'Detalhes da cidade não encontrados.' });
            return;
        }
    
        res.json(details);
        
    } catch (error) {
        console.error('Erro no controller de detalhes da cidade:', error);
        
        res.status(500).json({ message: 'Erro interno ao buscar detalhes da cidade.' });
        return;
    }
};