"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";

import {  Clock, Info, Users, Vote } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/ui/card";
import { Button } from "@/ui/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@/ui/ui/badge";
import bullrichPic from "@/img/bullrich.jpg";
import massa from "@/img/massa.jpg";
import milei from "@/img/milei.jpg";

// IMPORTANTE: Reemplazá estos valores por tu contrato real:
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

const candidatesData = [
  {
    id: 0,
    name: "Javier Milei",
    party: "La Libertad Avanza (LLA)",
    image: milei,
    description: "Economista libertario, conocido por su estilo provocador y propuestas radicales.",
    proposals: [
      "Dolarización de la economía.",
      "Eliminación del Banco Central.",
      "Reducción del gasto público en 15 puntos del PBI.",
    ],
    experience: "Diputado nacional por la Ciudad de Buenos Aires desde 2021.",
  },
  {
    id: 1,
    name: "Sergio Massa",
    party: "Unión por la Patria (UxP)",
    image: massa,
    description: "Político peronista, actual Ministro de Economía al momento de las elecciones.",
    proposals: [
      "Estabilización económica y control de la inflación.",
      "Impulso a la producción nacional.",
      "Fortalecimiento del mercado interno.",
    ],
    experience: "Ministro de Economía desde 2022; previamente, presidente de la Cámara de Diputados y jefe de Gabinete.",
  },
  {
    id: 2,
    name: "Patricia Bullrich",
    party: "Juntos por el Cambio (JxC)",
    image: bullrichPic,
    description: "Dirigente del PRO, con una amplia trayectoria en la función pública.",
    proposals: [
      "Creación de una fuerza policial especializada en inteligencia criminal.",
      "Implementación de un sistema bimonetario (peso y dólar)",
      "Reforma del Estado para reducir ministerios y cargos políticos.",
    ],
    experience: "Ministra de Seguridad (2015-2019) y Ministra de Trabajo (2000-2001).",
  },
];

interface CandidateVotes {
  [key: number]: bigint;
}

export function Candidates() {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [votes, setVotes] = useState<CandidateVotes>({});

  const connectProvider = () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  };

  const loadVotes = async () => {
    try {
      const provider = connectProvider();
      const contract = new ethers.Contract(contractAddress, contractABI, await provider);
      const candidatos = await contract.obtenerResultados();
      const votosActualizados: CandidateVotes = {};
      candidatos.forEach((candidato: any, index: number) => {
        votosActualizados[index] = candidato.votos;
      });
      setVotes(votosActualizados);
    } catch (error) {
      console.error("Error loading votes:", error);
      alert("Error loading votes. Check console.");
    }
  };

  const handleVote = async (candidateId: number) => {
    if (!window.ethereum) {
      alert("Wallet not detected. Please install MetaMask.");
      return;
    }

    try {
      setIsVoting(true);

      const provider = connectProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        alert("Wrong network. Please connect to the Sepolia testnet.");
        setIsVoting(false);
        return;
      }

      const tx = await contract.votar(candidateId);
      alert("Transaction sent. Waiting for confirmation...");

      await tx.wait();
      await loadVotes();

      alert("Vote successful! Your vote has been recorded on blockchain.");

      setIsDialogOpen(false);
      setSelectedCandidate(null);
    } catch (error: any) {
      console.error("Error voting:", error);
      alert(`Voting failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    loadVotes();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {candidatesData.map((candidate) => (
        <Card key={candidate.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{candidate.name}</CardTitle>
              <Badge variant="outline" className="px-2 py-1">
                {candidate.party}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" /> {(votes[candidate.id] ?? 0).toString()} votos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative w-full mb-4 overflow-hidden rounded-md aspect-square">
              <Image
                src={candidate.image}
                alt={candidate.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Dialog
              open={isDialogOpen && selectedCandidate === candidate.id}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedCandidate(null);
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedCandidate(candidate.id)}>
                  <Info className="w-4 h-4 mr-2" /> Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{candidate.name}</DialogTitle>
                  <DialogDescription>
                    {candidate.party} • {(votes[candidate.id] ?? 0).toString()} votos
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="proposals" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="proposals">Propuestas</TabsTrigger>
                    <TabsTrigger value="experience">Experiencia</TabsTrigger>
                  </TabsList>
                  <TabsContent value="proposals" className="mt-4">
                    <ul className="pl-5 space-y-2 list-disc">
                      {candidate.proposals.map((proposal, index) => (
                        <li key={index} className="text-sm">
                          {proposal}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="experience" className="mt-4">
                    <p className="text-sm">{candidate.experience}</p>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                  <Button onClick={() => handleVote(candidate.id)} disabled={isVoting} className="w-full">
                    {isVoting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" /> Votando..
                      </>
                    ) : (
                      <>
                        <Vote className="w-4 h-4 mr-2" /> Votar por {candidate.name}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              className="flex-1"
              onClick={() => {
                setSelectedCandidate(candidate.id);
                handleVote(candidate.id);
              }}
            >
              <Vote className="w-4 h-4 mr-2" /> Votar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
