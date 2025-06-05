// backend/src/controllers/packageController.ts
import { Request, Response } from 'express';
import { generateTravelPackage } from '../services/packageGeneratorService';
import asyncHandler from '../utils/asyncHandler';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const generatePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Mude de 'destination' para 'destino' e de 'budget' para 'orcamento'
  const { destino, orcamento, adults, children, dateIn, dateOut } = req.body; // <<-- MUDANÇA AQUI!
  const userId = req.user?.id;

  // Os console.log já estão aqui, ótimos!
  console.log("--- Backend Debug (packageController - Dados Recebidos) ---");
  console.log("Corpo da Requisição (req.body):", req.body);
  console.log("userId recebido:", userId);
  console.log("Destino recebido:", destino, "Tipo:", typeof destino); // <<-- MUDANÇA AQUI!
  console.log("Orcamento recebido:", orcamento, "Tipo:", typeof orcamento); // <<-- MUDANÇA AQUI!
  console.log("Adults recebido:", adults, "Tipo:", typeof adults);
  console.log("--- FIM DEBUG BACKEND (packageController) ---");


  if (!userId || !destino || !orcamento || !adults || !dateIn || !dateOut) { // <<-- MUDANÇA AQUI!
    res.status(400).json({ message: 'Dados incompletos para gerar o pacote. Verifique destino, orçamento, datas, adultos e crianças.' });
    return;
  }

  try {
    const generatedPackage = await generateTravelPackage({
      userId,
      destinationName: destino, // <<-- MUDANÇA AQUI! (passa 'destino' para o serviço)
      budget: parseFloat(orcamento), // <<-- MUDANÇA AQUI! (passa 'orcamento' para o serviço)
      adults: parseInt(adults),
      children: parseInt(children),
      dateIn,
      dateOut,
    });

    res.status(200).json({
        message: 'Pacote gerado com sucesso!',
        package: generatedPackage
    });

  } catch (error: any) {
    console.error("Erro ao gerar pacote de viagem no controller:", error);
    res.status(500).json({ message: error.message || 'Erro interno no servidor ao gerar pacote.' });
  }
});