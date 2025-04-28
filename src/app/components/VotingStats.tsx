"use client";

import { useState, useEffect } from "react";
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
  const [timeRemaining, setTimeRemaining] = useState<string>("2 days 14 hours");
  const [participation, setParticipation] = useState<number>(42); // Este sigue mock, salvo que tu contrato maneje censo de votantes

  const loadVotes = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, await provider);
      const candidatos = await contract.obtenerResultados();

      let votosTotales = 0;
      candidatos.forEach((candidato: any) => {
        votosTotales += Number(candidato.votos);
      });

      setTotalVotes(votosTotales);
    } catch (error) {
      console.error("Error loading voting stats:", error);
    }
  };

  useEffect(() => {
    loadVotes();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          <Vote className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotes.toLocaleString()}</div>
          <CardDescription className="text-xs">Votes recorded on blockchain</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
          <Clock className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{timeRemaining}</div>
          <CardDescription className="text-xs">Until voting closes</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Participation</CardTitle>
          <Users className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{participation}%</div>
            <Progress value={participation} className="h-2" />
          </div>
          <CardDescription className="text-xs">Of eligible voters</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
