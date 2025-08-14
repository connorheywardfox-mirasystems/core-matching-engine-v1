import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    role_title: "Senior Associate - Litigation",
    match_score: "87%",
    description: "Senior Associate position focusing on commercial litigation with a leading international law firm. The role involves complex dispute resolution, contract analysis, and client management. Based in London with hybrid working options available.",
    match_reason: "5y commercial litigation; London availability.",
    matched_at: "2024-01-15T10:30:00Z"
  },
  {
    role_title: "Associate - Commercial Disputes",
    match_score: "74%",
    description: "Mid-level Associate role specializing in commercial disputes and contract law. Strong emphasis on document review, legal drafting, and case preparation. Excellent career progression opportunities.",
    match_reason: "Document review + drafting expertise.",
    matched_at: "2024-01-15T10:30:00Z"
  },
  {
    role_title: "Counsel - Litigation",
    match_score: "69%",
    description: "Counsel position with focus on public law matters and high-stakes litigation. Requires strong advocacy skills and courtroom experience. Leading international firm with premium client base.",
    match_reason: "Public law exposure and advocacy skills.",
    matched_at: "2024-01-15T10:30:00Z"
  },
  {
    role_title: "Senior Associate - M&A",
    match_score: "65%",
    description: "Senior Associate role in the M&A team of a top-tier law firm. Focus on complex corporate transactions, due diligence, and deal structuring. Fast-paced environment with international exposure.",
    match_reason: "Corporate transaction experience.",
    matched_at: "2024-01-15T10:30:00Z"
  },
  {
    role_title: "Associate - Employment Law",
    match_score: "62%",
    description: "Associate position in the Employment team focusing on contentious and non-contentious employment matters. Includes tribunal representation, policy drafting, and strategic HR advice.",
    match_reason: "Employment law specialization potential.",
    matched_at: "2024-01-15T10:30:00Z"
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