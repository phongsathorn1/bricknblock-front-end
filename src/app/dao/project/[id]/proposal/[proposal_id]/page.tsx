'use client';

import {
  DAO_PROPOSALS_ABI,
  FUNDRAISING_DAO_ABI,
  FUNDRAISING_FACTORY_DAO_ABI,
  PROPERTY_TOKEN_ABI,
} from '@/constants/abi';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import {
  GET_FUNDRAISING_DAO_BY_ID,
  GET_PROPOSAL_BY_ID,
  GET_VOTING_POWER,
} from '@/lib/graphql/queries';
import { useGraphQuery } from '@/lib/hooks/useGraphQL';
import { ethers } from 'ethers';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Proposal } from '../../page';

type VoteOption = 'for' | 'against' | 'abstain';

enum ProposalType {
  OffChain = 0,
  OnChain = 1,
  TransferFunds = 2,
  Fundraising = 3,
}

const getProposalTypeLabel = (type: ProposalType) => {
  switch (type) {
    case ProposalType.OffChain:
      return 'Off-Chain';
    case ProposalType.OnChain:
      return 'On-Chain';
    case ProposalType.TransferFunds:
      return 'Transfer Funds';
    case ProposalType.Fundraising:
      return 'Fundraising';
    default:
      return 'Unknown';
  }
};

type Investment = {
  amount: string;
  claimed: boolean;
  id: string;
  investor: string;
  timestamp: string;
};

type FundraisingDao = {
  address: string;
  createdAt: string;
  deadline: string;
  goalAmount: string;
  id: string;
  isCompleted: boolean;
  maxInvestment: string;
  minInvestment: string;
  proposalId: string;
  totalRaised: string;
  investments: Investment[];
};

const WaitingModal = ({
  isOpen,
  message,
  refetch,
}: {
  isOpen: boolean;
  message: string;
  refetch: () => void;
}) => {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  useEffect(() => {
    if (prevIsOpen && !isOpen) {
      refetch();
    }
    setPrevIsOpen(isOpen);
  }, [isOpen, prevIsOpen, refetch]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-4 border-prime-gold border-t-transparent'></div>
          <p className='text-text-primary'>{message}</p>
        </div>
      </div>
    </div>
  );
};

const VoteModal = ({
  isOpen,
  onClose,
  selectedVote,
  onVoteSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedVote: VoteOption | null;
  onVoteSubmit: (vote: VoteOption) => void;
}) => {
  const params = useParams();
  const projectId = params.id;

  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem('address');
    const isConnected = localStorage.getItem('isConnected') === 'true';
    setAddress(address);
    setIsConnected(isConnected);
  }, []);

  const { data, loading, error } = useGraphQuery<{ propertyToken: any }>(
    GET_VOTING_POWER(
      (projectId as string).toLocaleLowerCase(),
      address?.toLocaleLowerCase() ?? ''
    )
  );

  if (!isOpen || !selectedVote) return null;

  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-medium text-text-primary'>
            Confirm Vote
          </h3>
          <button
            onClick={onClose}
            className='text-text-secondary hover:text-text-primary'
          >
            ✕
          </button>
        </div>

        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <div
              className={`w-3 h-3 rounded-full ${
                selectedVote === 'for'
                  ? 'bg-green-500'
                  : selectedVote === 'against'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
            />
            <span className='text-text-primary capitalize'>{selectedVote}</span>
          </div>

          <div className='p-4 bg-stone-700 rounded-lg'>
            <p className='text-sm text-text-secondary'>Voting with:</p>
            <p className='text-text-primary font-medium'>
              {data?.propertyToken.balances[0].holder.balances[0].balance /
                Math.pow(10, 18)}{' '}
              {data?.propertyToken.symbol}
            </p>
          </div>
        </div>

        <div className='flex gap-4'>
          <button
            onClick={onClose}
            className='flex-1 px-6 py-3 border border-stone-700 rounded text-text-primary hover:border-prime-gold/50 transition-colors duration-200'
          >
            Cancel
          </button>
          <button
            onClick={() => onVoteSubmit(selectedVote)}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300'
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
};

const FundraisingDaoBlock = ({
  setIsFundModalOpen,
  factoryFundraisingDaoAddress,
  projectId,
}: {
  setIsFundModalOpen: any;
  factoryFundraisingDaoAddress: string;
  projectId: string;
}) => {
  // const [signer, setSigner] = useState<ethers.Signer | null>(null);
  // const [isConnected, setIsConnected] = useState(false);

  // useEffect(() => {
  //     if (window.ethereum) {
  //         const provider = new ethers.providers.Web3Provider(window.ethereum);

  //         provider.listAccounts().then(async (accounts) => {
  //             if (accounts.length > 0) {
  //                 setIsConnected(true);
  //                 setSigner(provider.getSigner());
  //             }
  //         });
  //     }
  // }, []);

  // useEffect(() => {
  // const getFactoryFundraisingDaoAddress = async () => {
  // if (!signer) return;
  // const factoryFundraisingDaoContract = new ethers.Contract(
  //     CONTRACT_ADDRESSES.FactoryFundraisingDao,
  //     FUNDRAISING_FACTORY_DAO_ABI,
  //     signer
  // );

  // const _factoryFundraisingDaoAddress = await factoryFundraisingDaoContract.allFundraisingDaoContracts(0)

  // setFactoryFundraisingDaoAddress(_factoryFundraisingDaoAddress);
  // console.log('factoryFundraisingDaoAddress:', factoryFundraisingDaoAddress);
  // }

  //     getFactoryFundraisingDaoAddress();
  // }, [signer]);

  const { data, loading, error, refetch } = useGraphQuery<{
    fundraisingDao: FundraisingDao;
  }>(
    GET_FUNDRAISING_DAO_BY_ID(factoryFundraisingDaoAddress?.toLowerCase() || '')
  );

  console.log('fundraisingDao', data);
  const handleClaim = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
 
      const fundraisingDaoContract = new ethers.Contract(
        factoryFundraisingDaoAddress || '',
        FUNDRAISING_DAO_ABI,
        signer
      )
      
      const claimResult = await fundraisingDaoContract.claimTokens()s
     
    } catch (error) {
      console.error('Error Claim token:', error)
    } finally {
       
    }
  };

  
  return (
    data?.fundraisingDao && (
      <div className="mt-8 p-6 card-prime rounded-lg border border-prime-gray/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-text-primary">
            Fundraising DAO Details
          </h3>
          <span
            className={`px-2 py-1 rounded ${
              data?.fundraisingDao.isCompleted
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
            }`}
          >
            {data?.fundraisingDao.isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-text-secondary">Target Amount</p>
            <p className="text-text-primary text-2xl font-medium">
              {ethers.utils.formatUnits(
                data?.fundraisingDao.goalAmount || 0,
                18
              )}{' '}
              USDT
            </p>
          </div>
          <div>
            <p className="text-text-secondary">Current Amount</p>
            <p className="text-text-primary text-2xl font-medium">
              {ethers.utils.formatUnits(
                data?.fundraisingDao.totalRaised || 0,
                18
              )}{' '}
              USDT
            </p>
          </div>
          <div className="w-full bg-stone-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-prime-gold to-prime-gold/80 h-4 rounded-full"
              style={{
                width: `${Math.min(
                  ((Number(data?.fundraisingDao.totalRaised) || 0) /
                    (Number(data?.fundraisingDao.goalAmount) || 0)) *
                    100,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>
              {Math.round(
                (Number(data?.fundraisingDao.totalRaised || 0) /
                  Number(data?.fundraisingDao.goalAmount || 0)) *
                  100
              )}
              % Funded
            </span>
          </div>
          {data?.fundraisingDao.isCompleted ? (
            <>
              <div className="text-text-secondary text-sm">
                Treasury Address:{' '}
                <a
                  href={`https://testnet.bscscan.com/address/${projectId}`}
                  target="_blank"
                  className="text-prime-gold hover:text-prime-gold/80 transition-colors duration-200"
                >
                  {projectId}
                </a>
              </div>
              <button
                onClick={() => handleClaim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300"
              >
                Claim token
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300"
            >
              Contribute Funds
            </button>
          )}
        </div>
      </div>
    )
  )
};

const FundModal = ({
  isOpen,
  onClose,
  onFundSubmit,
  factoryFundraisingDaoAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFundSubmit: (amount: number) => void;
  factoryFundraisingDaoAddress: string;
}) => {
  const [amount, setAmount] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      provider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setSigner(provider.getSigner());
        }
      });
    }
  }, []);

  const handleFundSubmit = async (amount: number) => {
    if (!signer) return;
    try {
      setIsWaitingModalOpen(true);
      setWaitingMessage('Processing your contribution...');

      setWaitingMessage('Approving USDT to contract...');
      console.log('Approving USDT to contract...');
      const usdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT,
        [
          // ERC20 ABI for approve function
          {
            constant: false,
            inputs: [
              { name: '_spender', type: 'address' },
              { name: '_value', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            type: 'function',
          },
        ],
        signer
      );

      const approveTx = await usdtContract.approve(
        factoryFundraisingDaoAddress,
        ethers.utils.parseEther(amount.toString())
      );

      await approveTx.wait();
      console.log('USDT approved:', approveTx);

      setWaitingMessage('Processing your contribution...');
      console.log(
        'factoryFundraisingDaoAddress2:',
        factoryFundraisingDaoAddress
      );
      const fundraisingDaoContract = new ethers.Contract(
        factoryFundraisingDaoAddress,
        FUNDRAISING_DAO_ABI,
        signer
      );

      console.log('amount:', ethers.utils.parseEther(amount.toString()));

      const result = await fundraisingDaoContract.invest(
        ethers.utils.parseEther(amount.toString())
      );
      console.log('result:', result);

      const resultReceipt = await result.wait();
      console.log('resultReceipt:', resultReceipt);

      setWaitingMessage('Contribution successful!');
      setTimeout(() => {
        setIsWaitingModalOpen(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setWaitingMessage('Transaction failed. Please try again.');
      setTimeout(() => {
        setIsWaitingModalOpen(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
        <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-lg'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-xl font-medium text-text-primary'>
              Contribute Funds
            </h3>
            <button
              onClick={onClose}
              className='text-text-secondary hover:text-text-primary'
            >
              ✕
            </button>
          </div>

          <div className='mb-6'>
            <label className='block text-text-secondary mb-2'>
              Amount (USDT)
            </label>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full p-3 bg-stone-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-prime-gold/50'
              placeholder='Enter amount...'
            />
          </div>

          <div className='flex gap-4'>
            <button
              onClick={onClose}
              className='flex-1 px-6 py-3 border border-stone-700 rounded text-text-primary hover:border-prime-gold/50 transition-colors duration-200'
            >
              Cancel
            </button>
            <button
              onClick={() => handleFundSubmit(Number(amount))}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300'
            >
              Contribute
            </button>
          </div>
        </div>
      </div>

      {isWaitingModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-stone-800 border border-prime-gray/30 rounded-lg p-6 w-full max-w-sm text-center'>
            <div className='mb-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-prime-gold mx-auto'></div>
            </div>
            <p className='text-text-primary'>{waitingMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default function ProposalPage() {
  const params = useParams();
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [status, setStatus] = useState<string>('Unknown');
  const [activeTab, setActiveTab] = useState<'proposal' | 'votes' | 'timeline'>(
    'proposal'
  );
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  const [factoryFundraisingDaoAddress, setFactoryFundraisingDaoAddress] =
    useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      provider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setSigner(provider.getSigner());
        }
      });
    }
  }, []);

  const { data, loading, error, refetch } = useGraphQuery<{
    proposal: Proposal;
  }>(GET_PROPOSAL_BY_ID(params.proposal_id as string));

  useEffect(() => {
    if (data?.proposal.fundraisingDao) {
      setFactoryFundraisingDaoAddress(data.proposal.fundraisingDao.address);
    }
  }, [data]);

  useEffect(() => {
    const getStatus = async () => {
      let _status = 'Unknown';
      if (!signer || !params.proposal_id) return _status;
      const PropertyGovernanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PropertyGovernance,
        DAO_PROPOSALS_ABI,
        signer
      );

      const proposalId = params.proposal_id.toString().split('-')[1];

      const state = await PropertyGovernanceContract.getProposalState(
        params.id,
        proposalId
      );
      console.log('state:', state);

      switch (state) {
        case 0:
          _status = 'Pending';
          break;
        case 1:
          _status = 'Active';
          break;
        case 2:
          _status = 'Defeated';
          break;
        case 3:
          _status = 'Succeeded';
          break;
        case 4:
          _status = 'Executed';
          break;
        default:
          _status = 'Unknown';
      }

      console.log('status:', _status);
      setStatus(_status);
    };

    if (signer) {
      getStatus();
    }
  }, [signer, params, isConnected]);

  if (loading) return null;
  if (error) return <div>Error loading proposal</div>;
  if (!data) return null;

  console.log('data5:', data);
  const proposalData = JSON.parse(data.proposal.description);

  const totalVotes =
    parseInt(data.proposal.forVotes) + parseInt(data.proposal.againstVotes);
  const forPercentage =
    totalVotes > 0 ? (parseInt(data.proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0
      ? (parseInt(data.proposal.againstVotes) / totalVotes) * 100
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-prime-gold/10 text-prime-gold';
      case 'Defeated':
        return 'bg-red-500/10 text-red-500';
      case 'Succeeded':
      case 'Executed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleVoteSubmit = async (vote: VoteOption) => {
    console.log('Submitting vote:', vote);

    try {
      setIsPending(true);
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
        params.id?.toString() || '',
        PROPERTY_TOKEN_ABI,
        signer
      );

      setIsWaitingModalOpen(true);
      setWaitingMessage('Delegating voting power...');
      // const delegateResult = await DelegateContract.delegate(signer.getAddress());
      // const delegateReceipt = await delegateResult.wait();
      // console.log('Delegate receipt:', delegateReceipt);

      setWaitingMessage('Casting vote...');
      const voteResult = await PropertyGovernanceContract.castVote(
        params.id as string,
        data.proposal.proposalId,
        vote === 'for'
      );
      await voteResult.wait();
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsWaitingModalOpen(false);
      setIsVoteModalOpen(false);
      setIsPending(false);
    }
  };

  const handleExecute = async () => {
    try {
      setIsPending(true);
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

      setIsWaitingModalOpen(true);
      setWaitingMessage('Executing proposal...');
      const executeResult = await PropertyGovernanceContract.executeProposal(
        params.id as string,
        data.proposal.proposalId
      );

      const receipt = await executeResult.wait();
      console.log('Receipt:', receipt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsWaitingModalOpen(false);
      setIsPending(false);
    }

    console.log(
      'Executing proposal...',
      params.id as string,
      data.proposal.proposalId
    );
  };

  const handleFundSubmit = (amount: number) => {
    console.log('Contributing funds:', amount);
    setIsFundModalOpen(false);
  };

  const handleSkipVotingDelay = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const PropertyGovernanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PropertyGovernance,
        DAO_PROPOSALS_ABI,
        signer
      );

      setIsWaitingModalOpen(true);
      setWaitingMessage('Skipping voting delay...');
      const skipVotingDelayResult =
        await PropertyGovernanceContract.skipVotingDelay(
          params.id as string,
          data.proposal.proposalId
        );

      const skipVotingDelayReceipt = await skipVotingDelayResult.wait();
      console.log('Skip voting delay receipt:', skipVotingDelayReceipt);
    } catch (error) {
      console.error('Error skipping voting delay:', error);
    } finally {
      setIsWaitingModalOpen(false);
    }
  };

  const handleSkipVotingPeriod = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const PropertyGovernanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PropertyGovernance,
        DAO_PROPOSALS_ABI,
        signer
      );

      console.log(
        'Skipping voting delay...',
        params.id as string,
        data.proposal.proposalId
      );
      setIsWaitingModalOpen(true);
      setWaitingMessage('Skipping voting period...');
      const skipVotingPeriodResult =
        await PropertyGovernanceContract.skipVotingPeriod(
          params.id as string,
          data.proposal.proposalId
        );
      const skipVotingPeriodReceipt = await skipVotingPeriodResult.wait();
      console.log('Skip voting period receipt:', skipVotingPeriodReceipt);
    } catch (error) {
      console.error('Error skipping voting period:', error);
    } finally {
      setIsWaitingModalOpen(false);
    }
  };




  return (
    <div className='min-h-screen bg-prime-black'>
      <div className='max-w-6xl mx-auto px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-medium text-text-primary mb-4'>
            {proposalData.title}
          </h1>
          <div className='flex items-center gap-3'>
            <span className='text-text-secondary'>
              {data.proposal.proposer}
            </span>
            <span className='text-text-secondary'>•</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
            <span className='text-text-secondary'>•</span>
            <span className='text-text-secondary'>
              {getProposalTypeLabel(data.proposal.proposalType as ProposalType)}
            </span>
          </div>
        </div>

        {/* Skip Voting Controls */}
        <div className='mb-8 flex gap-4'>
          <button
            onClick={handleSkipVotingDelay}
            className='px-4 py-2 bg-prime-gold/20 text-prime-gold rounded-lg hover:bg-prime-gold/30 transition-colors'
          >
            Skip Voting Delay
          </button>
          <button
            onClick={handleSkipVotingPeriod}
            className='px-4 py-2 bg-prime-gold/20 text-prime-gold rounded-lg hover:bg-prime-gold/30 transition-colors'
          >
            Skip Voting Period
          </button>
        </div>

        <div className='flex gap-8'>
          <div className='flex-1'>
            {/* Tabs */}
            <div className='flex gap-4 mb-6 border-b border-prime-gray/30'>
              <button
                onClick={() => setActiveTab('proposal')}
                className={`pb-4 px-2 ${
                  activeTab === 'proposal'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Proposal
              </button>
              <button
                onClick={() => setActiveTab('votes')}
                className={`pb-4 px-2 ${
                  activeTab === 'votes'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Votes
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-4 px-2 ${
                  activeTab === 'timeline'
                    ? 'text-prime-gold border-b-2 border-prime-gold'
                    : 'text-text-secondary'
                }`}
              >
                Timeline
              </button>
            </div>

            {activeTab === 'proposal' ? (
              <div className='prose prose-invert max-w-none mb-8'>
                <div className='pt-5 py-20 px-5 my-5 rounded-lg bg-stone-800'>
                  <p>{proposalData.detail}</p>
                </div>
                {status === 'Succeeded' && (
                  <button
                    onClick={handleExecute}
                    className='px-6 py-3 bg-gradient-to-r from-prime-gold to-prime-gold/80 text-prime-black font-medium rounded hover:from-prime-gold/90 hover:to-prime-gold/70 transition-all duration-300'
                  >
                    Execute Proposal
                  </button>
                )}
                {data.proposal.proposalType === ProposalType.Fundraising &&
                  status === 'Executed' && (
                    <FundraisingDaoBlock
                      setIsFundModalOpen={setIsFundModalOpen}
                      factoryFundraisingDaoAddress={
                        factoryFundraisingDaoAddress || ''
                      }
                      setFactoryFundraisingDaoAddress={
                        setFactoryFundraisingDaoAddress
                      }
                      projectId={params.id as string}
                    />
                  )}
              </div>
            ) : activeTab === 'votes' ? (
              <div className='space-y-4'>
                {data.proposal.votes.map((vote: any, index: number) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 border border-prime-gray/30 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-text-primary'>
                        {vote.voterAddress}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          vote.support
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {vote.support ? 'For' : 'Against'}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='text-text-primary'>
                        {Number(vote.weight) / Math.pow(10, 18)} votes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='relative'>
                <div className='absolute left-2 top-0 bottom-0 w-0.5 bg-prime-gray/30'></div>
                <div className='space-y-6'>
                  {/* Timeline events would go here */}
                </div>
              </div>
            )}
          </div>

          <div className='w-80 space-y-6'>
            {/* Information */}
            <div className='card-prime'>
              <h3 className='text-lg font-medium text-text-primary mb-4'>
                Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-text-secondary'>Start Time</div>
                  <div className='text-text-primary'>
                    {new Date(
                      parseInt(data.proposal.startTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-text-secondary'>End Time</div>
                  <div className='text-text-primary'>
                    {new Date(
                      parseInt(data.proposal.endTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-text-secondary'>Duration</div>
                  <div className='text-text-primary'>
                    {Math.ceil(
                      (parseInt(data.proposal.endTime) -
                        parseInt(data.proposal.startTime)) /
                        (24 * 60 * 60)
                    )}{' '}
                    days
                  </div>
                </div>
                <div>
                  <div className='text-sm text-text-secondary'>
                    Proposal Type
                  </div>
                  <div className='text-text-primary'>
                    {getProposalTypeLabel(
                      data.proposal.proposalType as ProposalType
                    )}
                  </div>
                </div>
                {data.proposal.proposalType === ProposalType.TransferFunds && (
                  <>
                    <div>
                      <div className='text-sm text-text-secondary'>
                        Token Address
                      </div>
                      <div className='text-text-primary break-words'>
                        {
                          ethers.utils.defaultAbiCoder.decode(
                            ['address', 'address', 'uint256'],
                            data.proposal.callData
                          )[0]
                        }
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-text-secondary'>
                        Transfer To Wallet
                      </div>
                      <div className='text-text-primary break-words'>
                        {
                          ethers.utils.defaultAbiCoder.decode(
                            ['address', 'address', 'uint256'],
                            data.proposal.callData
                          )[1]
                        }
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-text-secondary'>Amount</div>
                      <div className='text-text-primary break-words'>
                        {ethers.utils.formatEther(
                          ethers.utils.defaultAbiCoder.decode(
                            ['address', 'address', 'uint256'],
                            data.proposal.callData
                          )[2]
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Current Results */}
            <div className='card-prime'>
              <h3 className='text-lg font-medium text-text-primary mb-4'>
                Current Results
              </h3>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-text-primary'>For</span>
                    <span className='text-text-secondary'>
                      {forPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500 rounded-full'
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                  <div className='text-sm text-text-secondary mt-1'>
                    {Number(data.proposal.forVotes) / Math.pow(10, 18)} Votes
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-text-primary'>Against</span>
                    <span className='text-text-secondary'>
                      {againstPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className='h-2 bg-prime-black/50 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-red-500 rounded-full'
                      style={{ width: `${againstPercentage}%` }}
                    />
                  </div>
                  <div className='text-sm text-text-secondary mt-1'>
                    {Number(data.proposal.againstVotes) / Math.pow(10, 18)}{' '}
                    Votes
                  </div>
                </div>
                <div className='pt-2 border-t border-prime-gray/30'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-text-primary'>Total Votes</span>
                    <span className='text-text-secondary'>
                      {(Number(data.proposal.forVotes) +
                        Number(data.proposal.againstVotes)) /
                        Math.pow(10, 18)}{' '}
                      Votes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Vote */}
            {status === 'Active' && (
              <div className='card-prime'>
                <h3 className='text-lg font-medium text-text-primary mb-4'>
                  Cast your vote
                </h3>
                <div className='space-y-2'>
                  {(['for', 'against'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedVote(option);
                        setIsVoteModalOpen(true);
                      }}
                      className={`w-full p-4 rounded-lg border-2 ${
                        selectedVote === option
                          ? option === 'for'
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : 'border-red-500 bg-red-500/20 text-red-400'
                          : option === 'for'
                          ? 'border-green-500/50 hover:bg-green-500/10 text-green-500'
                          : 'border-red-500/50 hover:bg-red-500/10 text-red-500'
                      } transition-all duration-200 capitalize font-medium 
                                            active:scale-[0.99] shadow-sm hover:shadow-md`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        selectedVote={selectedVote}
        onVoteSubmit={handleVoteSubmit}
      />

      <FundModal
        factoryFundraisingDaoAddress={factoryFundraisingDaoAddress || ''}
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFundSubmit={handleFundSubmit}
      />

      <WaitingModal
        isOpen={isWaitingModalOpen}
        message={waitingMessage}
        refetch={refetch}
      />
    </div>
  );
}
