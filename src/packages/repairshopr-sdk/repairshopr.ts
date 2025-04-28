export class RepairShoprClient {
    constructor(private apiKey: string) {}
  
    async request(endpoint: string, options: RequestInit = {}) {
      const url = `https://${process.env.RS_SUBDOMAIN}.repairshopr.com/api/v1/${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      if (!res.ok) throw new Error(`RepairShopr API error: ${res.status}`);
      return res.json();
    }
  
    tickets = {
      async list() {
        return this.request('tickets');
      },
      async get(id: number) {
        return this.request(`tickets/${id}`);
      },
      async update(id: number, body: any) {
        return this.request(`tickets/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      },
      async addPublicNote(id: number, body: string) {
        return this.request(`tickets/${id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ body, hidden: false }),
        });
      },
    };
  
    customers = {
      async get(id: number) {
        return this.request(`customers/${id}`);
      }
    };
  
    parts = {
      async list() {
        return this.request('parts');
      }
    };
  }
  