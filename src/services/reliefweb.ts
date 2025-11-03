/**
 * ReliefWeb API Service
 * Fetches real humanitarian crisis and disaster data
 * API Documentation: https://apidoc.reliefweb.int/
 */

const RELIEFWEB_API_BASE = 'https://api.reliefweb.int/v2';
const APP_NAME = 'chainai.app'; // Required parameter

interface ReliefWebReport {
  id: string;
  fields: {
    title: string;
    body?: string;
    date: {
      created: string;
    };
    country?: Array<{ 
      name: string;
      iso3?: string;
      location?: Array<{
        lat: number;
        lon: number;
      }>;
    }>;
    disaster?: Array<{ name: string }>;
    theme?: Array<{ name: string }>;
    source?: Array<{ name: string }>;
    url?: string;
    city?: string;
  };
}

interface ReliefWebDisaster {
  id: string;
  fields: {
    name: string;
    status: string;
    date: {
      created: string;
    };
    country?: Array<{ name: string }>;
    type?: Array<{ name: string }>;
    description?: string;
  };
}

interface ReliefWebResponse<T> {
  data: T[];
  totalCount: number;
}

/**
 * Fetch recent humanitarian reports related to supply chain disruptions
 */
export async function fetchSupplyChainReports(limit = 10): Promise<ReliefWebReport[]> {
  try {
    const response = await fetch(
      `${RELIEFWEB_API_BASE}/reports?appname=${APP_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit,
          preset: 'latest',
          fields: {
            include: ['title', 'body', 'date', 'country', 'disaster', 'theme', 'source', 'url']
          },
          filter: {
            operator: 'OR',
            conditions: [
              {
                field: 'theme.name',
                value: 'Logistics and Telecommunications'
              },
              {
                field: 'theme.name',
                value: 'Health'
              },
              {
                field: 'body',
                value: 'supply',
                operator: 'AND'
              }
            ]
          },
          sort: ['date.created:desc']
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status}`);
    }

    const data: ReliefWebResponse<ReliefWebReport> = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ReliefWeb reports:', error);
    return [];
  }
}

/**
 * Fetch active disasters that may impact supply chains
 */
export async function fetchActiveDisasters(limit = 10): Promise<ReliefWebDisaster[]> {
  try {
    const response = await fetch(
      `${RELIEFWEB_API_BASE}/disasters?appname=${APP_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit,
          preset: 'latest',
          fields: {
            include: ['name', 'status', 'date', 'country', 'type', 'description']
          },
          filter: {
            field: 'status',
            value: 'ongoing'
          },
          sort: ['date.created:desc']
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status}`);
    }

    const data: ReliefWebResponse<ReliefWebDisaster> = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ReliefWeb disasters:', error);
    return [];
  }
}

/**
 * Search for specific crisis or location
 */
export async function searchCrisis(query: string): Promise<ReliefWebReport[]> {
  try {
    const response = await fetch(
      `${RELIEFWEB_API_BASE}/reports?appname=${APP_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 20,
          query: {
            value: query,
            fields: ['title', 'body', 'country.name'],
            operator: 'OR'
          },
          fields: {
            include: ['title', 'body', 'date', 'country', 'disaster', 'theme', 'source', 'url']
          },
          sort: ['date.created:desc']
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ReliefWeb API error: ${response.status}`);
    }

    const data: ReliefWebResponse<ReliefWebReport> = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching ReliefWeb:', error);
    return [];
  }
}

/**
 * Format report for display
 */
export function formatReport(report: ReliefWebReport): string {
  const title = report.fields.title;
  const countries = report.fields.country?.map(c => c.name).join(', ') || 'Global';
  const date = new Date(report.fields.date.created).toLocaleDateString();
  const source = report.fields.source?.[0]?.name || 'ReliefWeb';
  
  return `**${title}**\n📍 ${countries}\n📅 ${date}\n📰 Source: ${source}`;
}

/**
 * Format disaster for display
 */
export function formatDisaster(disaster: ReliefWebDisaster): string {
  const name = disaster.fields.name;
  const countries = disaster.fields.country?.map(c => c.name).join(', ') || 'Multiple';
  const type = disaster.fields.type?.[0]?.name || 'Crisis';
  const status = disaster.fields.status;
  
  return `**${name}**\n🌍 ${countries}\n⚠️ ${type} (${status})`;
}
