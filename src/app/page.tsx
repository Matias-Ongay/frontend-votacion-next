import { Candidates } from "./components/Candidates";
import { ConnectWallet } from "./components/ConnectWallet";
import { VotingStats } from "./components/VotingStats";


export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <header className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Decentralized Voting</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Vote for your favorite candidate on the Sepolia testnet
            </p>
          </div>
          <ConnectWallet />
        </header>

        <VotingStats />

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">Candidates</h2>
          <Candidates />
        </section>
      </div>
    </main>
  );
}
