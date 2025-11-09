import { Request, Response } from "express";
import * as cityService from "../services/cityService";

/**
 * Endpoint para obter sugestões de nomes de cidades.
 * Rota: /api/cities/suggestions?search=...
 */
export const getCitiesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchText = req.query.search as string | undefined;
    const cities = await cityService.getCitySuggestions(searchText);
    res.json(cities);
  } catch (error) {
    console.error('Erro no controller de sugestões de cidades:', error);
    res.status(500).json({ message: 'Erro interno ao buscar sugestões.' });
  }
};

/**
 * Endpoint para obter detalhes de orçamento DIÁRIO da cidade (Custo base por dia).
 * Rota: /api/cities/details?cityName=...
 */
export const getCityDailyDetailsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const cityName = req.query.cityName as string;
    const userId = (req as any).userId; 

    if (!cityName) {
      res.status(400).json({ message: 'O nome da cidade é obrigatório.' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    const details = await cityService.getCityDetails(cityName, userId); 
    
    if (!details) {
        res.status(404).json({ message: 'Detalhes da cidade não encontrados no banco de dados.' });
        return;
    }
    
    res.json(details);
  } catch (error) {
    console.error('Erro no controller de detalhes diários da cidade:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes da cidade.' });
  }
};

/**
 * Endpoint para calcular o Orçamento TOTAL do Pacote (Multiplicando por Dias e Pessoas).
 * Rota: /api/cities/package?cityName=...&numPeople=...&numDays=...
 */
export const calculatePackageBudgetController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Recebimento e parse dos parâmetros
    const cityName = req.query.cityName as string;
    const numPeople = parseInt(req.query.numPeople as string, 10);
    const numDays = parseInt(req.query.numDays as string, 10);

    // >>> DEBUG LOG 1: VERIFICANDO OS INPUTS
    console.log("Recebido (Package Inputs):", { cityName, numPeople, numDays });

    if (!cityName || typeof cityName !== "string") {
      res.status(400).json({ error: "Nome da cidade inválido." });
      return;
    }

    if (isNaN(numPeople) || numPeople < 1) {
      res.status(400).json({ error: "Número de pessoas inválido." });
      return;
    }

    if (isNaN(numDays) || numDays < 1) {
      res.status(400).json({ error: "Número de dias inválido." });
      return;
    }

    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: "Token inválido ou ausente." });
      return;
    }

    // Chamada à função de cálculo total
    const cityDetails = await cityService.calculateTotalBudget(
      cityName,
      userId,
      numPeople,
      numDays
    );

    if (!cityDetails) {
        res.status(404).json({ error: "Pacote ou detalhes da cidade não encontrados." });
        return;
    }
    
    // >>> DEBUG LOG 2: VERIFICANDO O OUTPUT FINAL
    console.log("Resultado FINAL (Budget Total):", cityDetails);

    res.json(cityDetails);
  } catch (error) {
    console.error("Erro em calculatePackageBudgetController:", error);
    res.status(500).json({ error: "Erro ao calcular o pacote de viagem." });
  }
};