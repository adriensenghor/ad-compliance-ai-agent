export type ComplianceStatus = 'APPROVED' | 'REJECTED';

export interface ComplianceResponse {
  utah: { status: ComplianceStatus; explanation: string };
  nevada: { status: ComplianceStatus; explanation: string };
}

export const RULES = {
  utah: {
    name: 'Utah – No Party Words Rule',
    description:
      'Ad copy must not include party or lifestyle language such as “party”, “beach”, “club”, “friends”, “nightlife”, or “fun”. Purely descriptive product messaging is allowed.',
    short: 'No party / lifestyle words.',
  },
  nevada: {
    name: 'Nevada – 21+ Explicit Rule',
    description:
      'Ad copy must explicitly contain the exact text “21+”. If “21+” is missing anywhere in the script, the ad is automatically rejected.',
    short: 'Must explicitly contain “21+”.',
  },
} as const;

export const SCENARIOS = [
  {
    id: 'scenario-1',
    label: 'Scenario 1 – Fully Compliant',
    script:
      'Crafted with 100% local barley and pure spring water. A traditional premium beer. Must be 21+ to enjoy.',
  },
  {
    id: 'scenario-2',
    label: 'Scenario 2 – Nevada Only',
    script:
      'Bring the fun to the beach! Grab a cold beer and party all night with your friends. 21+ only.',
  },
  {
    id: 'scenario-3',
    label: 'Scenario 3 – Total Failure',
    script:
      'Hit the club this weekend for the ultimate nightlife experience. Enjoy our ultra-smooth vodka today!',
  },
];

