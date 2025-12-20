import { useState } from 'react';
import { types, cities, type Resource, type ResourceType, type City } from '../data/resources';

interface ResourceSubmissionProps {
    onClose: () => void;
    onSubmit: (resource: Resource) => void;
}

export const ResourceSubmission = ({ onClose, onSubmit }: ResourceSubmissionProps) => {
    const [formData, setFormData] = useState({
        name: '',
        city: 'Mumbai' as City,
        type: 'food' as ResourceType,
        address: '',
        phone: '',
        isVolunteer: false,
        consent: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.consent) {
            alert("Please agree to local storage usage.");
            return;
        }

        const newResource: Resource = {
            id: `local-${Date.now()}`,
            name: formData.name + (formData.isVolunteer ? ' (Volunteer)' : ''),
            city: formData.city,
            type: formData.type,
            address: formData.address,
            phone: formData.phone,
            hours: 'Check with contact',
            services: ['Community Submission'],
            languages: ['Local'],
            verified_by: 'Community',
            last_updated: new Date().toISOString().split('T')[0],
            is_emergency: false,
            transport_estimates: { walking: '?', bus: '?', car: '?' },
            micro_guide: 'Added by local community member.'
        };

        onSubmit(newResource);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="border border-teal-800 bg-slate-900 w-full max-w-lg p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

                <h2 className="text-xl font-bold text-teal-500 mb-1">ADD COMMUNITY RESOURCE</h2>
                <p className="text-xs text-gray-500 mb-6 border-b border-gray-800 pb-2">
                    Help your neighbors by adding local knowledge.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
                    <div>
                        <label className="block text-gray-400 text-xs uppercase mb-1">Name / Organization</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 p-2 text-white focus:border-teal-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase mb-1">City</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value as City })}
                            >
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase mb-1">Type</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 p-2 text-white outline-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as ResourceType })}
                            >
                                {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-xs uppercase mb-1">Address / Location</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 p-2 text-white focus:border-teal-500 outline-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="e.g. Behind Central Park..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-xs uppercase mb-1">Contact Phone</label>
                        <input
                            required
                            type="tel"
                            className="w-full bg-slate-800 border border-slate-700 p-2 text-white focus:border-teal-500 outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="accent-teal-500"
                                checked={formData.isVolunteer}
                                onChange={e => setFormData({ ...formData, isVolunteer: e.target.checked })}
                            />
                            <span className="text-gray-300">I am volunteering personally</span>
                        </label>
                    </div>

                    <div className="mt-6 p-3 bg-teal-900/10 border border-teal-900/30 rounded">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                required
                                className="mt-1 accent-teal-500"
                                checked={formData.consent}
                                onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                            />
                            <div className="text-xs text-gray-400">
                                <span className="font-bold text-teal-400 block mb-1">PRIVACY CONSENT (REQUIRED)</span>
                                I agree to store this data locally on this device. I understand it is NOT sent to any server and is only for personal/demo use.
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 mt-4 border border-teal-500 uppercase tracking-widest disabled:opacity-50"
                        disabled={!formData.consent}
                    >
                        Save Locally
                    </button>

                    <p className="text-[10px] text-center text-gray-600 mt-2">
                        NO SERVER • NO TRACKING • OFFLINE FIRST
                    </p>
                </form>
            </div>
        </div>
    );
};
