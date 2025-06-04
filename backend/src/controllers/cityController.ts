// backend/src/controllers/cityController.ts
import { Request, Response } from 'express';
import { getCitiesFromDb } from '../services/cityService'; // Você precisará criar este service
import asyncHandler from '../utils/asyncHandler'; // Seu asyncHandler para erros

export const getCities = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query; // Pega o parâmetro de busca, se houver

  const cities = await getCitiesFromDb(search as string); // Chama o serviço para buscar cidades
  res.json(cities);
});