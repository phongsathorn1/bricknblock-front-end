'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { DAO_PROPOSALS_ABI, PROPERTY_TOKEN_ABI } from '@/constants/abi';

type BaseProposalFields = {
    title: string;
    detail: string;
    durationDays: string;
};

type OffChainProposal = BaseProposalFields & {
    type: ProposalType.OffChain;
};

type OnChainProposal = BaseProposalFields & {
    type: ProposalType.OnChain;
    callData: string;
};

type TransferFundsProposal = BaseProposalFields & {
    type: ProposalType.TransferFunds;
    tokenAddress: string;
    toAddress: string;
    amount: string;
};

type FundraisingProposal = BaseProposalFields & {
    type: ProposalType.Fundraising;
    goalAmount: string;
    minInvestment: string;
    maxInvestment: string;
};

type ProposalFormData = OffChainProposal | OnChainProposal | TransferFundsProposal | FundraisingProposal;

enum ProposalType {
    OffChain = 0,
    OnChain = 1,
    TransferFunds = 2,
    Fundraising = 3
}

const WaitingModal = ({
    isOpen,
    message
}: {
    isOpen: boolean;
    message: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-prime-gold border-t-transparent"></div>
                    <p className="text-text-primary">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default function CreateProposal() {
    const [isConnected, setIsConnected] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('');

    useEffect(() => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            provider.listAccounts().then((accounts) => {
                if (accounts.length > 0) {
                    setIsConnected(true);
                }
            });
        }
    }, []);


    const { id: projectId } = useParams();
    const [formData, setFormData] = useState<ProposalFormData>({
        type: ProposalType.OffChain,
        title: '',
        detail: '',
        durationDays: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting proposal:', formData);
        await handleCreateProposal(formData);
    };

    const handleCreateProposal = async (data: any) => {
        try {
            setIsPending(true); // Start loading
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install it to continue.');
                return;
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const PropertyGovernanceContract = new ethers.Contract(
                CONTRACT_ADDRESSES.PropertyGovernance,
                DAO_PROPOSALS_ABI,
                signer
            );

            const DelegateContract = new ethers.Contract(
                projectId?.toString() || '',
                PROPERTY_TOKEN_ABI,
                signer
            );

            const getCallData = (type: ProposalType) => {
                console.log('type', type)
                let callDataPayload = '0x'
                if (type === ProposalType.OffChain) { return callDataPayload }
                else {
                    if (type === ProposalType.OnChain) {
                        callDataPayload = data.callData;
                    }
                    if (type === ProposalType.TransferFunds) {
                        callDataPayload = ethers.utils.defaultAbiCoder.encode(
                            ['address', 'address', 'uint256'],
                            [data.tokenAddress, data.toAddress, ethers.utils.parseEther(data.amount)]
                        );
                    }
                    if (type === ProposalType.Fundraising) {
                        console.log('gg', [ethers.utils.parseEther(data.goalAmount), ethers.utils.parseEther(data.minInvestment), ethers.utils.parseEther(data.maxInvestment), parseInt(data.durationDays)])
                        callDataPayload = ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256', 'uint256', 'uint256'],
                            [ethers.utils.parseEther(data.goalAmount), ethers.utils.parseEther(data.minInvestment), ethers.utils.parseEther(data.maxInvestment), parseInt(data.durationDays)]
                        );
                        console.log('callDataPayload', callDataPayload);
                    }
                }
                return callDataPayload;
            };

            setIsWaitingModalOpen(true);
            setWaitingMessage('Delegating voting power...');
            console.log('signer.getAddress()', signer.getAddress(), 'projectId', projectId?.toString());
            const delegateResult = await DelegateContract.delegate(signer.getAddress());
            console.log('Delegate result:', delegateResult);

            const delegateReceipt = await delegateResult.wait();
            console.log('Delegate receipt:', delegateReceipt);

            setWaitingMessage('Creating proposal...');
            const proposalResult = await PropertyGovernanceContract.propose(
                projectId,
                JSON.stringify({ title: data.title, detail: data.detail }),
                data.type,
                getCallData(data.type),
                data.proposalType === ProposalType.OnChain ? data.targetAddress : '0x0000000000000000000000000000000000000000'
            );
            console.log('Proposal result:', proposalResult);

            setWaitingMessage('Waiting for confirmation...');
            const receipt = await proposalResult.wait();
            console.log('Receipt:', receipt);

            // window.location.href = `/dao/project/${projectId}/`;

        } catch (error) {
            console.error('Error creating proposal:', error);
        } finally {
            setIsWaitingModalOpen(false);
            setIsPending(false); // Stop loading
        }
    };

    const handleTypeChange = (type: ProposalType) => {
        const baseFields = {
            title: formData.title,
            detail: formData.detail,
            durationDays: formData.durationDays,
        };

        switch (type) {
            case ProposalType.OffChain:
                setFormData({ ...baseFields, type });
                break;
            case ProposalType.OnChain:
                setFormData({ ...baseFields, type, callData: '' });
                break;
            case ProposalType.TransferFunds:
                setFormData({ ...baseFields, type, tokenAddress: '', toAddress: '', amount: '' });
                break;
            case ProposalType.Fundraising:
                setFormData({ ...baseFields, type, goalAmount: '', minInvestment: '', maxInvestment: '' });
                break;
        }
    };

    const renderAdditionalFields = () => {
        switch (formData.type) {
            case ProposalType.OffChain:
                return null;
            case ProposalType.OnChain:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Call Data</label>
                            <input
                                type="text"
                                value={formData.callData}
                                onChange={(e) => setFormData({ ...formData, callData: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Enter call data"
                                required
                            />
                        </div>
                    </>
                );
            case ProposalType.TransferFunds:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Token Address</label>
                            <input
                                type="text"
                                value={formData.tokenAddress}
                                onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Enter token address"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">To Address</label>
                            <input
                                type="text"
                                value={formData.toAddress}
                                onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Enter recipient address"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Amount</label>
                            <input
                                type="text"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                    </>
                );
            case ProposalType.Fundraising:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Goal Amount</label>
                            <input
                                type="text"
                                value={formData.goalAmount}
                                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Enter goal amount"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Min Investment</label>
                            <input
                                type="text"
                                value={formData.minInvestment}
                                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Minimum investment"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">Max Investment</label>
                            <input
                                type="text"
                                value={formData.maxInvestment}
                                onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value })}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                                placeholder="Maximum investment"
                                required
                            />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-prime-black">
            <div className="max-w-4xl mx-auto px-8 py-12">
                <h1 className="font-display text-4xl uppercase tracking-wider text-text-primary mb-8">
                    Create Proposal
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Proposal Type */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Proposal Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(Number(e.target.value) as ProposalType)}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                                rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                            required
                        >
                            <option value={ProposalType.OffChain}>Off Chain</option>
                            <option value={ProposalType.OnChain}>On Chain</option>
                            <option value={ProposalType.TransferFunds}>Transfer Funds</option>
                            <option value={ProposalType.Fundraising}>Fundraising</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                                rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                            placeholder="Enter proposal title"
                            required
                        />
                    </div>

                    {/* Detail */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Detail
                        </label>
                        <textarea
                            value={formData.detail}
                            onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                                rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                                min-h-[200px]"
                            placeholder="Enter proposal details"
                            required
                        />
                    </div>

                    {/* Additional Fields */}
                    {renderAdditionalFields()}

                    {/* Duration Days */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Duration (Days)
                        </label>
                        <input
                            type="number"
                            value={formData.durationDays}
                            onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                                rounded-lg text-text-primary focus:outline-none focus:border-prime-gold"
                            placeholder="Enter duration in days"
                            min="1"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full btn-prime bg-prime-gold hover:bg-prime-gold/90 text-black py-4"
                    >
                        Create Proposal
                    </button>
                </form>

                <WaitingModal isOpen={isWaitingModalOpen} message={waitingMessage} />
            </div>
        </div>
    );
}
