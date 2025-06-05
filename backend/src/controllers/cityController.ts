// backend/src/controllers/cityController.ts
import { Request, Response } from 'express';
import { getCitiesFromDb } from '../services/cityService';
import asyncHandler from '../utils/asyncHandler';

export const getCities = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;

  const cities = await getCitiesFromDb(search as string);

  console.log("--- Backend Debug (getCitySuggestions) ---");
  console.log("Termo de busca recebido:", search);
  console.log("Cidades retornadas pelo serviço (antes de enviar):", cities); // <<< ADICIONE ESTA LINHA

  res.json(cities);
});