import React from "react";
import ContractTools from "./ContractTools";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex justify-center items-center gap-8 bg-gray-900 text-white p-4 text-center">
      <p>© {new Date().getFullYear()} DexFlow. All rights reserved.</p>
      <div className="flex justify-center space-x-4">
        <a href="https://github.com/hehekyo/auction-app" target="_blank" rel="noopener noreferrer">
          <FaGithub className="w-6 h-6 text-white" />
        </a>
        <a href="https://discord.gg/your-invite" target="_blank" rel="noopener noreferrer">
          <FaDiscord className="w-6 h-6 text-white" />
        </a>
      </div>
      <ContractTools />
    </footer>
  );
}
