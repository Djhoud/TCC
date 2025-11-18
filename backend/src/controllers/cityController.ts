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
export const calculatePackageBudgetController = async (req: Request, res: Response): Promise<void> => {
  try {
    const cityName = req.query.cityName as string;
    const numPeople = parseInt(req.query.numPeople as string, 10);
    const numDays = parseInt(req.query.numDays as string, 10);

    // ✅ LOG DETALHADO
    console.log("🎯 CALCULANDO ORÇAMENTO TOTAL:", { 
        cityName, 
        numPeople, 
        numDays,
        timestamp: new Date().toISOString()
    });

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
    
    // ✅ LOG DO RESULTADO
    console.log("📊 RESULTADO ORÇAMENTO TOTAL:", {
        city: cityDetails.nome,
        minBudget: cityDetails.minBudget,
        maxBudget: cityDetails.maxBudget,
        calculatedAt: new Date().toISOString()
    });

    res.json(cityDetails);
  } catch (error) {
    console.error("❌ Erro em calculatePackageBudgetController:", error);
    res.status(500).json({ error: "Erro ao calcular o pacote de viagem." });
  }
};