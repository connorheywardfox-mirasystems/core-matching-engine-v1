import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    role_title: "Senior Associate - Litigation",
    display_title: "Senior Associate - Litigation at Clifford Chance",
    match_score: "87%",
    description: "Senior Associate position focusing on commercial litigation with a leading international law firm. The role involves complex dispute resolution, contract analysis, and client management. Based in London with hybrid working options available.",
    match_reason: "5y commercial litigation; London availability.",
    matched_at: "2024-01-15T10:30:00Z",
    firm_name: "Clifford Chance",
    firm_location: "London",
    firm_website: "https://www.cliffordchance.com"
  },
  {
    role_title: "Associate - Commercial Disputes",
    display_title: "Associate - Commercial Disputes at Linklaters",
    match_score: "74%",
    description: "Mid-level Associate role specializing in commercial disputes and contract law. Strong emphasis on document review, legal drafting, and case preparation. Excellent career progression opportunities.",
    match_reason: "Document review + drafting expertise.",
    matched_at: "2024-01-15T10:30:00Z",
    firm_name: "Linklaters",
    firm_location: "London",
    firm_website: "https://www.linklaters.com"
  },
  {
    role_title: "Counsel - Litigation",
    display_title: "Counsel - Litigation at Allen & Overy",
    match_score: "69%",
    description: "Counsel position with focus on public law matters and high-stakes litigation. Requires strong advocacy skills and courtroom experience. Leading international firm with premium client base.",
    match_reason: "Public law exposure and advocacy skills.",
    matched_at: "2024-01-15T10:30:00Z",
    firm_name: "Allen & Overy",
    firm_location: "London",
    firm_website: "https://www.allenovery.com"
  },
  {
    role_title: "Senior Associate - M&A",
    display_title: "Senior Associate - M&A at Freshfields",
    match_score: "65%",
    description: "Senior Associate role in the M&A team of a top-tier law firm. Focus on complex corporate transactions, due diligence, and deal structuring. Fast-paced environment with international exposure.",
    match_reason: "Corporate transaction experience.",
    matched_at: "2024-01-15T10:30:00Z",
    firm_name: "Freshfields Bruckhaus Deringer",
    firm_location: "London",
    firm_website: "https://www.freshfields.com"
  },
  {
    role_title: "Associate - Employment Law",
    display_title: "Associate - Employment Law at Slaughter and May",
    match_score: "62%",
    description: "Associate position in the Employment team focusing on contentious and non-contentious employment matters. Includes tribunal representation, policy drafting, and strategic HR advice.",
    match_reason: "Employment law specialization potential.",
    matched_at: "2024-01-15T10:30:00Z",
    firm_name: "Slaughter and May",
    firm_location: "London"
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