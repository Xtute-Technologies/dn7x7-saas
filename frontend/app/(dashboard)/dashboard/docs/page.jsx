import { CodeBlock } from "@/components/code-block";

export default function DocsPage() {
  const curlExample = `curl -X GET "https://api.dairynews7x7.com/api/news/" \\
  -H "X-API-KEY: YOUR_API_KEY"`;

  const pythonExample = `import requests

api_key = "YOUR_API_KEY"
url = "https://api.dairynews7x7.com/api/news/"

headers = {
    "X-API-KEY": api_key
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Error: {response.status_code}")
    print(response.text)`;

  const axiosExample = `import axios from 'axios';

const apiKey = 'YOUR_API_KEY';
const url = 'https://api.dairynews7x7.com/api/news/';

const fetchNews = async () => {
  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-KEY': apiKey
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.response ? error.response.data : error.message);
  }
};

fetchNews();`;

  const listResponseExample = `{
  "results": [
    {
      "id": 123,
      "title": "Global Dairy Prices See a Slight Increase",
      "excerpt": "After a period of stability, global dairy prices have shown a modest rise in the latest auction, driven by demand from Southeast Asia...",
      "image": "https://dairynews7x7.com/wp-content/uploads/2024/01/sample-image.jpg",
      "url": "https://dairynews7x7.com/news/global-dairy-prices-slight-increase",
      "published_at": "2026-01-05T10:00:00Z",
      "categories": ["Global", "Market"]
    }
  ],
  "count": 542,
  "page": 1,
  "page_size": 1,
  "total_pages": 542
}`;

  const detailResponseExample = `{
  "id": 123,
  "title": "Global Dairy Prices See a Slight Increase",
  "content": "<p>After a period of stability, global dairy prices have shown a modest rise in the latest auction, driven by demand from Southeast Asia. This trend is expected to continue into the next quarter.</p>",
  "image": "https://dairynews7x7.com/wp-content/uploads/2024/01/sample-image.jpg",
  "url": "https://dairynews7x7.com/news/global-dairy-prices-slight-increase",
  "published_at": "2026-01-05T10:00:00Z",
  "categories": ["Global", "Market"]
}`;

  return (
    <div className="p-4 md:p-8 space-y-12 w-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>

      {/* Authentication Section */}
      <section id="authentication" className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Authentication</h2>
        <p>
          To use the DairyNews7x7 API, you need an API key. You can generate and manage your API keys from the{" "}
          <a href="/dashboard/api-keys" className="text-primary hover:underline">API Keys</a> section of your dashboard.
        </p>
        <p>
          Include your API key in the <code className="bg-muted px-1 rounded">X-API-KEY</code> header with every request.
        </p>
        <h3 className="text-xl font-semibold pt-4">Examples</h3>
        <h4 className="text-lg font-medium">cURL</h4>
        <CodeBlock code={curlExample} lang="bash" />
        <h4 className="text-lg font-medium">Python (requests)</h4>
        <CodeBlock code={pythonExample} lang="python" />
        <h4 className="text-lg font-medium">JavaScript (axios)</h4>
        <CodeBlock code={axiosExample} lang="javascript" />
      </section>

      {/* Billing Section */}
      <section id="billing" className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Billing & Credits</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Each successful API request to a news endpoint costs <strong>1 credit</strong>.</li>
          <li>All users receive a number of free credits daily.</li>
          <li>Paid plans with higher limits will be available soon. You can monitor your usage from the <a href="/dashboard/billing" className="text-primary hover:underline">Billing</a> page.</li>
        </ul>
      </section>

      {/* Endpoints Section */}
      <section id="endpoints" className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">News API Endpoints</h2>
        
        <div id="list-news" className="space-y-3 pt-4">
          <h3 className="text-xl font-semibold">List News Articles</h3>
          <p>
            <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm">GET /api/news/</span>
          </p>
          <p>Returns a paginated list of news articles.</p>
          
          <h4 className="text-lg font-medium">Query Parameters</h4>
          <ul className="list-disc list-inside space-y-2">
            <li><code className="bg-muted px-1 rounded">page</code>: The page number to retrieve. (Default: <code className="bg-muted px-1 rounded">1</code>)</li>
            <li><code className="bg-muted px-1 rounded">page_size</code>: The number of items per page. (Default: <code className="bg-muted px-1 rounded">20</code>, Max: <code className="bg-muted px-1 rounded">100</code>)</li>
            <li>
              <code className="bg-muted px-1 rounded">category</code>: Filter news by a specific category. Available options:
              <ul className="list-['-_'] list-inside pl-4">
                <li><code className="bg-muted px-1 rounded">indian</code></li>
                <li><code className="bg-muted px-1 rounded">global</code></li>
                <li><code className="bg-muted px-1 rounded">blog</code></li>
              </ul>
            </li>
          </ul>

          <h4 className="text-lg font-medium">Sample Response</h4>
          <CodeBlock code={listResponseExample} lang="json" />
        </div>

        <div id="detail-news" className="space-y-3 pt-8">
          <h3 className="text-xl font-semibold">Get a Single News Article</h3>
          <p>
            <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm">GET /api/news/&lt;post_id&gt;/</span>
          </p>
          <p>Returns a single news article by its ID.</p>

          <h4 className="text-lg font-medium">Sample Response</h4>
          <CodeBlock code={detailResponseExample} lang="json" />
        </div>
      </section>
    </div>
  );
}