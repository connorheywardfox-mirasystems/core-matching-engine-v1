import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    role_id: "role-uuid-123",
    title: "Senior Associate - Litigation",
    score: 0.87,
    reason: "5y commercial litigation; London availability.",
    long_description: "Senior Associate position focusing on commercial litigation with a leading international law firm. The role involves complex dispute resolution, contract analysis, and client management. Based in London with hybrid working options available."
  },
  {
    role_id: "role-uuid-456", 
    title: "Associate - Commercial Disputes",
    score: 0.74,
    reason: "Document review + drafting expertise.",
    long_description: "Mid-level Associate role specializing in commercial disputes and contract law. Strong emphasis on document review, legal drafting, and case preparation. Excellent career progression opportunities."
  },
  {
    role_id: "role-uuid-789",
    title: "Counsel - Litigation", 
    score: 0.69,
    reason: "Public law exposure and advocacy skills.",
    long_description: "Counsel position with focus on public law matters and high-stakes litigation. Requires strong advocacy skills and courtroom experience. Leading international firm with premium client base."
  },
  {
    role_id: "role-uuid-101",
    title: "Senior Associate - M&A",
    score: 0.65,
    reason: "Corporate transaction experience.",
    long_description: "Senior Associate role in the M&A team of a top-tier law firm. Focus on complex corporate transactions, due diligence, and deal structuring. Fast-paced environment with international exposure."
  },
  {
    role_id: "role-uuid-202",
    title: "Associate - Employment Law",
    score: 0.62,
    reason: "Employment law specialization potential.",
    long_description: "Associate position in the Employment team focusing on contentious and non-contentious employment matters. Includes tribunal representation, policy drafting, and strategic HR advice."
  }
];

export const testPayloads = [
  {
    name: "Jane Doe",
    text: "Jane Doe — 5 years commercial litigation, London-based, admitted England & Wales, strong document review."
  },
  {
    name: "John Smith", 
    text: "John Smith — 7 years M&A and corporate, strong negotiation and due diligence."
  },
  {
    name: "Asha Patel",
    text: "Asha Patel — 3 years employment law, strong drafting, open to relocation."
  }
];

export const simulateNetworkDelay = (min = 800, max = 1200) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};