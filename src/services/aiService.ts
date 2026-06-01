import type { Document, TaskPriority } from '../types';

export interface MeetingAnalysis {
  summary: string;
  actionItems: string[];
  deadlines: string[];
  risks: string[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  storyPoints: number;
  priority: TaskPriority;
}

// ----------------------------------------------------
// AI Knowledge Base Search
// ----------------------------------------------------
export const searchKnowledgeBase = (query: string, documents: Document[]): { doc: Document; matchScore: number; snippet: string }[] => {
  if (!query.trim()) return [];
  
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (terms.length === 0) return [];

  const results = documents.map(doc => {
    const text = (doc.title + " " + doc.content).toLowerCase();
    let score = 0;
    
    // Keyword match scoring
    terms.forEach(term => {
      const occurrences = text.split(term).length - 1;
      score += occurrences * 5;
    });

    if (score === 0) return null;

    // Extract relevant matching snippet
    let snippet = doc.content.substring(0, 160) + "...";
    const matchIdx = text.indexOf(terms[0]);
    if (matchIdx > -1) {
      const start = Math.max(0, matchIdx - 40);
      const end = Math.min(doc.content.length, matchIdx + 120);
      snippet = "..." + doc.content.substring(start, end).replace(/\n/g, ' ') + "...";
    }

    return {
      doc,
      matchScore: score,
      snippet
    };
  });

  return results
    .filter((r): r is { doc: Document; matchScore: number; snippet: string } => r !== null)
    .sort((a, b) => b.matchScore - a.matchScore);
};

// ----------------------------------------------------
// AI Task Backlog Generator
// ----------------------------------------------------
export const generateTaskBacklog = (prompt: string): Promise<GeneratedTask[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cleaned = prompt.toLowerCase();
      
      let tasks: GeneratedTask[] = [];

      if (cleaned.includes('food') || cleaned.includes('delivery') || cleaned.includes('restaurant')) {
        tasks = [
          {
            title: 'User Authentication & Profiles (Food Delivery App)',
            description: 'Configure standard email/password logins and Google authentication. Structure database collections for User profiles containing address lists and phone contacts.',
            storyPoints: 5,
            priority: 'High'
          },
          {
            title: 'Restaurant Directory & Menu Listing Api',
            description: 'Develop backend routes returning searchable arrays of local restaurants. Support tagging metadata (Cuisine, Distance, Rating, Price) and query optimizations.',
            storyPoints: 8,
            priority: 'Critical'
          },
          {
            title: 'Real-Time Order Cart & Checkout Pipeline',
            description: 'Build robust frontend React state context for shopping cart. Connect backend endpoints to create fresh order entries in MongoDB and compute delivery charges.',
            storyPoints: 5,
            priority: 'High'
          },
          {
            title: 'Stripe Gateway Payment Integration',
            description: 'Integrate secure Stripe webhooks. Set up backend controllers processing charges, validating billing addresses, and triggering successful confirmation receipts.',
            storyPoints: 8,
            priority: 'Critical'
          },
          {
            title: 'Driver Real-time GPS Tracker Interface',
            description: 'Design mock live map interface using Mapbox. Stream continuous latitude/longitude update packets over Socket.io connections from driver profile.',
            storyPoints: 8,
            priority: 'Medium'
          },
          {
            title: 'Admin Operations & Payout Console',
            description: 'Setup dashboard panel for restaurant partners. Permit modifying menus, adjusting operation hours, and reviewing monthly performance charts.',
            storyPoints: 5,
            priority: 'Low'
          }
        ];
      } else if (cleaned.includes('e-commerce') || cleaned.includes('shop') || cleaned.includes('store') || cleaned.includes('cart')) {
        tasks = [
          {
            title: 'Product Catalog Grid & Search Indexes',
            description: 'Build premium landing layout displaying responsive grids of product items. Integrate client-side searching and filters (Category, Price range, Brand).',
            storyPoints: 5,
            priority: 'High'
          },
          {
            title: 'Shopping Basket & LocalStorage Sync',
            description: 'Establish state manager to handle cart increments, decrements, and removals. Store cart state in LocalStorage to preserve selections on reload.',
            storyPoints: 3,
            priority: 'Medium'
          },
          {
            title: 'Payment checkout & Order Logs API',
            description: 'Create backend routes checking item inventories, compiling pricing sums, registering transactions, and saving clean Order logs in database.',
            storyPoints: 8,
            priority: 'Critical'
          },
          {
            title: 'Inventory Alerts & Seller Portal',
            description: 'Provide secure interface for listing inventory batches. Send automated alert notifications when item stock drops below threshold units.',
            storyPoints: 5,
            priority: 'Low'
          }
        ];
      } else {
        // Generic project default generator
        tasks = [
          {
            title: 'Define Project Roadmap & Core Data Architectures',
            description: `Core architecture scoping for: "${prompt}". Layout entity diagrams, register database schemas, and define central API path prefixes.`,
            storyPoints: 3,
            priority: 'High'
          },
          {
            title: 'Establish User Roles & Permissions Portal',
            description: 'Create custom JWT credentials handlers. Support role validations restricting access across public directories vs private operations panels.',
            storyPoints: 5,
            priority: 'High'
          },
          {
            title: 'Develop Central Platform Operations Dashboard',
            description: 'Assemble key UI workspace layouts. Render grids of active metrics, list recent team activity logs, and configure Recharts graphs.',
            storyPoints: 5,
            priority: 'Medium'
          },
          {
            title: 'Implement AI Auto-Sync Bot Pipelines',
            description: 'Integrate smart background tasks to poll server logs, process data feeds, flag anomalous thresholds, and shoot slack alert notifications.',
            storyPoints: 8,
            priority: 'Critical'
          },
          {
            title: 'Manual End-To-End Verification Testing',
            description: 'Verify system routes. Ensure responsive styling is correct across tablet/mobile screens, validate form Zod boundaries, and complete test logs.',
            storyPoints: 2,
            priority: 'Low'
          }
        ];
      }

      resolve(tasks);
    }, 2000); // Simulate network loader delay
  });
};

// ----------------------------------------------------
// AI Meeting Transcript Analyzer
// ----------------------------------------------------
export const analyzeMeetingTranscript = (transcriptText: string): Promise<MeetingAnalysis> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Very smart regex/keyword summary indexing of standard transcript logs
      const analysis: MeetingAnalysis = {
        summary: 'The team completed their daily sync to evaluate Sprint progress. A blocker regarding Docker cache pipelines was discussed, along with UI adjustments for video meetings and chat typing features.',
        actionItems: [
          'Amit Verma: Resolve Docker multi-stage cache build blocks',
          'Priya Patel: Standardize markdown parsing border styles in wiki doc',
          'Rahul Sharma: Verify test environment resource capacity and load limits'
        ],
        deadlines: [
          'Docker build resolution: Tuesday',
          'Sprint 24 wraps up: Wednesday'
        ],
        risks: [
          'Docker build cache latency could delay staging checks',
          'Test container could crash due to insufficient CPU memory'
        ]
      };

      // Custom variations if custom text is provided
      if (transcriptText.toLowerCase().includes('marketing') || transcriptText.toLowerCase().includes('sales')) {
        analysis.summary = 'The alignment sync focused on GTM marketing and target sales pipelines. The team discussed budget limits, ad CTR updates, and SEO strategies.';
        analysis.actionItems = [
          'John: Launch optimized Facebook ad target pixels',
          'Sarah: Complete Q3 campaign copy editing checksheets',
          'Amit: Setup redirect routers for marketing landing campaigns'
        ];
        analysis.deadlines = [
          'Ad campaign checks: Friday',
          'GTM Deck review: Next Monday'
        ];
        analysis.risks = [
          'Ad budgets could burn quickly due to poor keywords',
          'Traffic could saturate registration server limits'
        ];
      }

      resolve(analysis);
    }, 1800); // Simulated delay
  });
};
