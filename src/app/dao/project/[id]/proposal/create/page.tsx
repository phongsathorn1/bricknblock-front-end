'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

type ProposalFormData = {
    title: string;
    description: string;
    discussion: string;
    startDate: string;
    endDate: string;
};

export default function CreateProposal() {
    const { id: projectId } = useParams();
    const [formData, setFormData] = useState<ProposalFormData>({
        title: '',
        description: '',
        discussion: '',
        startDate: '',
        endDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement proposal creation logic
        console.log('Submitting proposal:', formData);
    };

    return (
        <div className="min-h-screen bg-prime-black">
            <div className="max-w-4xl mx-auto px-8 py-12">
                <h1 className="font-display text-4xl uppercase tracking-wider text-text-primary mb-8">
                    Create Proposal
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200"
                            placeholder="Enter proposal title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200 min-h-[200px]"
                            placeholder="Enter proposal description (supports markdown)"
                            required
                        />
                    </div>

                    {/* Discussion */}
                    <div className="space-y-2">
                        <label className="block text-text-primary font-medium">
                            Discussion
                        </label>
                        <input
                            type="url"
                            value={formData.discussion}
                            onChange={(e) => setFormData(prev => ({ ...prev, discussion: e.target.value }))}
                            className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                       rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                       transition-colors duration-200"
                            placeholder="Enter discussion URL (e.g. forum post)"
                            required
                        />
                    </div>

                    {/* Voting Period */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">
                                Start Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                         rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                         transition-colors duration-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-text-primary font-medium">
                                End Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-4 py-3 bg-prime-gray/20 border border-prime-gray/30 
                         rounded-lg text-text-primary focus:outline-none focus:border-prime-gold
                         transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full btn-prime bg-prime-gold hover:bg-prime-gold/90 text-black py-4"
                    >
                        Create Proposal
                    </button>
                </form>
            </div>
        </div>
    );
}

