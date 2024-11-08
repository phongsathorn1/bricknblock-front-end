// 'use client';

// import { createContext, useContext, ReactNode } from 'react';
// import { useAccount, useConnect } from 'wagmi';
// import { injected } from 'wagmi/connectors';

// interface WalletContextType {
//   address?: string;
//   isConnected: boolean;
//   handleConnect: () => void;
// }

// const WalletContext = createContext<WalletContextType | undefined>(undefined);

// export function WalletProvider({ children }: { children: ReactNode }) {
//   const { address, isConnected } = useAccount();
//   const { connect } = useConnect();

//   const handleConnect = () => {
//     connect({ connector: injected() });
//   };

//   return (
//     <WalletContext.Provider value={{ address, isConnected, handleConnect }}>
//       {children}
//     </WalletContext.Provider>
//   );
// }

// export function useWallet() {
//   const context = useContext(WalletContext);
//   if (context === undefined) {
//     throw new Error('useWallet must be used within a WalletProvider');
//   }
//   return context;
// }
