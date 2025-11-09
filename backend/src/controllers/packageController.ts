import { Request, Response } from "express";
import * as cityService from "../services/cityService";

// Nota: O nome da função deve ser corrigido para algo como calculatePackageBudgetController, 
// mas usaremos getCityDetails (seu nome original) para evitar quebras em outros arquivos.
export const getCityDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Corrigido para fazer o cast do tipo
    const cityName = req.query.cityName as string;
    const numPeople = parseInt(req.query.numPeople as string, 10);
    const numDays = parseInt(req.query.numDays as string, 10);

    console.log("Recebido (Package):", { cityName, numPeople, numDays });

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

    // CORREÇÃO AQUI: Chamada à NOVA FUNÇÃO de cálculo total
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
    
    res.json(cityDetails);
  } catch (error) {
    console.error("Erro em getCityDetails (packageController):", error);
    res.status(500).json({ error: "Erro ao calcular o pacote de viagem." });
  }
};