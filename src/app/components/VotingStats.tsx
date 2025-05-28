"use client";

import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/ui/card";
import { Progress } from "@/ui/ui/progress";
import { Clock, Users, Vote } from "lucide-react";

// IMPORTANTE: Reemplazá con tu contrato real
const contractAddress = "0x211115f8127dd11ab77e84623fcc3c1953d4655d";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "nombresCandidatos",
				"type": "string[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidatoIndex",
				"type": "uint256"
			}
		],
		"name": "votar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidatos",
		"outputs": [
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "votos",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "obtenerResultados",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "nombre",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "votos",
						"type": "uint256"
					}
				],
				"internalType": "struct SistemaVotacion.Candidato[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "votantes",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export function VotingStats() {
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // fijamos la fecha de fin: hoy + 14 días
  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.getTime();
  }, []);

  // carga de votos
  const loadVotes = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, await provider);
      const candidatos = await contract.obtenerResultados();
      const votosTotales = candidatos.reduce((sum: number, c: any) => sum + Number(c.votos), 0);
      setTotalVotes(votosTotales);
    } catch (error) {
      console.error("Error loading voting stats:", error);
    }
  };

  // inicializa la carga de votos
  useEffect(() => {
    loadVotes();
  }, []);

  // contador regresivo
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = endDate - now;
      if (diff <= 0) {
        setTimeRemaining("0d 0h 0m 0s");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [endDate]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Votos totales</CardTitle>
          <Vote className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotes.toLocaleString()}</div>
          <CardDescription className="text-xs">Votos guardados en la blockchain</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Restante</CardTitle>
          <Clock className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{timeRemaining}</div>
          <CardDescription className="text-xs">Para finalizar la votación</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cantidad de participantes</CardTitle>
          <Users className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <CardDescription className="text-xs">Participantes únicos</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}