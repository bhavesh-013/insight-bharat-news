/**
 * NewsAPI Client & Editorial Mock Database - Insight Samachar
 * Handles real-time queries with transparent fallback to local articles.
 *
 * NOTE: NewsAPI.org blocks direct browser requests (CORS). This file routes
 * all live requests through a public CORS proxy so they work client-side.
 */

const DEFAULT_NEWS_API_KEY_KEY = 'insight_samachar_api_key';

// Mock Editorial Dataset
const EDITORIAL_MOCK_DATABASE = [
  {
    id: "editorial-world-1",
    category: "world",
    title: "Global Climate Accord Reached in New Delhi Summit",
    description: "Representatives from over 120 nations have finalized a historic pact outlining accelerated green carbon offsets and joint financing for developing economies.",
    content: `In a landmark diplomatic breakthrough, representatives from over 120 nations have finalized a historic agreement at the environmental summit in New Delhi. The agreement, named the New Delhi Climate Covenant, outlines accelerated carbon emission reduction timelines and establishes a joint funding pool of $150 billion annually for developing economies.

The negotiations, which stretched over seven days of intense drafting and revision, concluded at midnight. Diplomats described the atmosphere as tense but ultimately cooperative. The deal addresses critical roadblocks that have stalled global climate actions for the past decade, including technical assistance transfers and global reporting standards.

"This is not just a document; it is a pledge to the next generation," remarked the summit's chairperson. "We have moved past debate and entered a phase of binding accountability." Industry reactions have been mixed, with green energy conglomerates praising the subsidy framework, while manufacturing bodies caution that the aggressive targets could challenge supply chain operations.`,
    author: "Arundhati Roy Chowdhury",
    source: { name: "Insight Samachar Editorial" },
    publishedAt: "2026-06-12T08:00:00Z",
    urlToImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    readingTime: "5 min read"
  },
  {
    id: "editorial-politics-1",
    category: "politics",
    title: "Parliament Debates Landmark Tech Regulation bill",
    description: "The digital sovereignty act aims to regulate artificial intelligence deployment, data privacy standards, and algorithmic transparency for consumer applications.",
    content: `The lower house of Parliament yesterday opened debate on the Digital Sovereignty Act, a sweeping piece of legislation intended to restructure tech oversight in the country. The bill targets three main sectors: private data retention limits, algorithmic bias disclosure requirements, and safety standards for consumer artificial intelligence models.

Supporters argue the legislation is long overdue, stating that the rapid growth of autonomous applications has outpaced current consumer protection acts. "Digital space is public space," said the Minister for Information Technology. "Our citizens deserve clear safeguards regarding their personal data and the algorithms that score them."

Conversely, startup groups and venture capitalists have voiced concerns over heavy compliance costs. A joint letter signed by fifty tech leaders warned that over-regulation could slow the pace of software innovation and discourage investments. The debate is expected to continue for two weeks before the bill moves to committee vote.`,
    author: "Rajesh K. Sharma",
    source: { name: "Insight Samachar Politics" },
    publishedAt: "2026-06-12T07:15:00Z",
    urlToImage: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
    readingTime: "6 min read"
  },
  {
    id: "editorial-business-1",
    category: "business",
    title: "UPI Processes Record 18 Billion Transactions in a Month",
    description: "Unified Payments Interface reaches a new milestone, solidifying the nation's leadership in digital micro-transactions and retail payments.",
    content: `The country's retail digital payments ecosystem has scaled a new peak, with the Unified Payments Interface (UPI) registering a record 18 billion transactions during the last month. Data released by the National Payments Corporation of India (NPCI) showed a 25% year-on-year increase in both transaction volume and monetary value.

Fintech analysts attribute this growth to the widespread integration of QR codes in rural markets and the launch of UPI Lite for low-value offline transactions. Small-town vendors and roadside shops now account for more than 40% of all transactions, demonstrating a deep transition from cash to digital billing.

"Digital infrastructure has become as essential as electricity," a senior central bank official stated. The next frontier for UPI is international expansion, with several neighboring countries and European travel hubs beginning to pilot direct merchant integration.`,
    author: "Meera Subramanian",
    source: { name: "Insight Samachar Business" },
    publishedAt: "2026-06-11T10:30:00Z",
    urlToImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    readingTime: "4 min read"
  },
  {
    id: "editorial-tech-1",
    category: "technology",
    title: "Bangalore Hub Unveils Next-Gen Silicon Architecture",
    description: "A local hardware venture has designed an ultra-efficient 3nm processor aimed at running large language models directly on mobile edge units.",
    content: `A Bangalore-based semiconductor startup has made waves in the hardware industry by unveiling a brand new 3-nanometer chip design. Code-named 'Agni-1', the chip is engineered specifically to process neural network weights locally on edge devices without relying on high-latency cloud servers.

Early benchmarks released by the team indicate a 40% reduction in power consumption compared to standard mobile processors, combined with a 2x boost in localized matrix math speed. This makes it highly suitable for running real-time speech translation and predictive agents on standard handheld devices.

"Our design shifts the bottleneck away from memory retrieval," said the Lead Architect. "By co-locating computation blocks and cash systems, we can process millions of parameters in milliseconds." The startup has secured manufacturing agreements with top overseas fabs, planning commercial shipping by early next year.`,
    author: "Vikram Sen",
    source: { name: "Insight Samachar Tech" },
    publishedAt: "2026-06-12T06:45:00Z",
    urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    readingTime: "4 min read"
  },
  {
    id: "editorial-sports-1",
    category: "sports",
    title: "Indian Cricket Team Triumphs in Thrilling Final Ball Finish",
    description: "An extraordinary display of composure in the death overs secures the ICC Champions Trophy in a packed stadium.",
    content: `In what will go down as one of the most dramatic finishes in modern cricket history, India secured a victory against Australia on the final delivery of the ICC Champions Trophy. Chasing a formidable target of 288, the team required 14 runs off the last six deliveries.

A dramatic boundary on the fourth ball and a crucial running double set up a final ball equation: 4 runs to win. The middle-order batsman connected with a clean drive over mid-off, sending the stadium into wild celebrations as the ball crossed the boundary rope.

"We believed in ourselves until the very last run," the captain stated in the post-match ceremony. Social media erupted with congratulations from sporting legends and political leaders alike. This victory marks the third major trophy for the national side in five years.`,
    author: "Sanjay Manjrekar Jr.",
    source: { name: "Insight Samachar Sports" },
    publishedAt: "2026-06-12T09:20:00Z",
    urlToImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
    readingTime: "5 min read"
  },
  {
    id: "editorial-science-1",
    category: "science",
    title: "ISRO Gaganyaan Mission Completes Crew Escape Simulation",
    description: "The national space agency has successfully validated the emergency launch abort system, paving the way for manned orbital flights.",
    content: `The Indian Space Research Organisation (ISRO) has marked a crucial milestone in its Gaganyaan human spaceflight program by successfully testing the Crew Escape System (CES). The abort simulation was executed at the Satish Dhawan Space Centre under stormy wind conditions.

The test vehicle lifted off at 08:00 AM, carrying a prototype crew module. At an altitude of 12 kilometers, onboard systems triggered the escape motors, simulating a critical rocket booster anomaly. The module was pulled rapidly away from the booster, deploying secondary stabilization parachutes before splashing down safely in the Bay of Bengal.

ISRO engineers confirmed that all telemetry parameters matched predictions. "The escape sequence executed exactly as programmed," the ISRO Chairperson announced. "This confirms that we can secure our crew in the unlikely event of an launch failure." The agency will conduct one more uncrewed orbital flight before launching astronauts.`,
    author: "Dr. K. Sivan Kutty",
    source: { name: "Insight Samachar Science" },
    publishedAt: "2026-06-11T14:10:00Z",
    urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    readingTime: "6 min read"
  },
  {
    id: "editorial-opinion-1",
    category: "opinion",
    title: "The Digital Commons: Reclaiming Our Public Square",
    description: "Why localizing servers and building open-source public protocols are essential for retaining democratic debate in the age of private networks.",
    content: `As communication channels consolidate into the hands of a few private platforms, the democratic nature of public debate is facing unprecedented pressure. Modern platforms are not merely passive utilities; they are active curators of attention, driven by algorithms designed for engagement rather than truth.

To preserve the public square, we must treat digital communication networks as municipal infrastructure. Just as cities build public roads, libraries, and parks, democracies must fund and support public communication protocols. 

Open-source standards like email or RSS proved that decentralized services can connect millions without corporate bottlenecks. By supporting federated protocols and localized data management, we can establish a digital commons that is resilient against both corporate monopoly and state censorship.`,
    author: "Prof. Ramachandra Guha",
    source: { name: "Insight Samachar Opinion" },
    publishedAt: "2026-06-12T05:30:00Z",
    urlToImage: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&auto=format&fit=crop&q=80",
    readingTime: "7 min read"
  },
  {
    id: "editorial-health-1",
    category: "health",
    title: "Ancient Herb Compounds Show Promise in Modern Lab Trials",
    description: "Ayurvedic extracts from Ashwagandha and Turmeric are being studied for their potential in neuroprotective therapies.",
    content: `A collaborative research study conducted by the National Institute of Mental Health and Neurosciences (NIMHANS) and global pharmacological labs has uncovered promising neurological applications for compounds found in traditional herbs. Specifically, active elements extracted from Ashwagandha (Withania somnifera) showed capabilities in preventing cellular plaques associated with cognitive decline.

In clinical trials involving animal models, the extract-treated group demonstrated a 30% retention in memory tasks compared to control groups. Researchers stressed that while these results are encouraging, extensive human clinical trials are required to establish dosage protocols and compound stability.

"This highlights the value of reverse pharmacology," said the Lead Researcher. "By looking at centuries of empirical clinical usage in traditional medicine, we can target promising molecules and validate them using modern scientific methodology."`,
    author: "Dr. Ananya Nair",
    source: { name: "Insight Samachar Health" },
    publishedAt: "2026-06-10T11:45:00Z",
    urlToImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
    readingTime: "5 min read"
  },
  {
    id: "editorial-entertainment-1",
    category: "entertainment",
    title: "New wave of Independent Indian Cinema Dominates Global Festivals",
    description: "Small-budget, regional stories focusing on local realism are earning critical acclaim and distribution deals at Cannes and Venice.",
    content: `Indian cinema is undergoing a notable aesthetic shift. While large-budget blockbusters continue to draw crowds, a quiet revolution is taking place in regional language filmmaking. Diverse indie projects, written and produced outside the standard studio ecosystems, are securing major awards at international film festivals.

Films shot in Malayalam, Marathi, and Assamese have recently bagged screenplay and direction prizes, highlighting themes of local realism, rural migrations, and changing relationships in modern India. 

"Audiences are searching for authenticity," a filmmaker remarked. "The hyper-local is the new global. A specific story about a remote village in Kerala can resonate with a viewer in Paris if the human emotion is honest." Streaming services are responding by increasing investment in independent acquisitions.`,
    author: "Rajeev Masand",
    source: { name: "Insight Samachar Arts" },
    publishedAt: "2026-06-11T16:00:00Z",
    urlToImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    readingTime: "4 min read"
  },
  {
    id: "editorial-tech-2",
    category: "technology",
    title: "The Quantum Leap: Quantum Cryptography Enters Commercial Use",
    description: "Banks and defense agencies are deploying quantum key distribution (QKD) lines to establish mathematically unhackable fiber links.",
    content: `Quantum cryptography has officially transitioned from academic research laboratories to live commercial applications. Leading financial institutions and national defense sectors have begun deploying Quantum Key Distribution (QKD) setups across key metropolitan fiber lines.

Unlike standard software-based encryption which relies on the mathematical complexity of prime factoring, QKD relies on the laws of physics. Any attempt to intercept or measure the quantum particles carrying the key automatically changes their state, alert-firing security teams immediately.

"It is mathematically impossible to copy or tap a quantum state without destroying the signal," explained a quantum security expert. The deployment is considered a preemptive response to the future threat of quantum computers capable of breaking current RSA standards.`,
    author: "Vikram Sen",
    source: { name: "Insight Samachar Tech" },
    publishedAt: "2026-06-09T09:00:00Z",
    urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
    readingTime: "5 min read"
  },
  {
    id: "editorial-world-2",
    category: "world",
    title: "Deep-Sea Research Expedition Discovers 50 New Species",
    description: "A marine exploration crew studying the Indian Ocean's Java Trench has documented unique organisms living near volcanic vents.",
    content: `A scientific team aboard the research vessel 'Sagar Nidhi' has returned from a month-long exploration of the Java Trench, documenting over fifty previously unknown marine species. The expedition employed remote-operated vehicles (ROVs) to survey volcanic hydrothermal vents at depths exceeding six thousand meters.

Among the discoveries are translucent crustaceans and chemo-synthetic bacteria that generate energy from sulfur emissions rather than sunlight. These findings provide new insights into the limits of organic life on Earth and could inform search strategies for extra-terrestrial biological signatures on frozen moons.

"The deep ocean remains less mapped than the surface of Mars," the expedition director noted. "We have barely scratched the surface of our planet's biological heritage." Detailed genetic sequencing will be published next month.`,
    author: "Arundhati Roy Chowdhury",
    source: { name: "Insight Samachar Science" },
    publishedAt: "2026-06-08T15:30:00Z",
    urlToImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    readingTime: "5 min read"
  },
  {
    id: "editorial-business-2",
    category: "business",
    title: "Electric Vehicle Ecosystem Boosted by New Battery Infrastructure",
    description: "A nationwide initiative to establish 10,000 rapid charging stations is set to accelerate electric two-wheeler adoption.",
    content: `The transition toward electric transport has received a major boost with the launch of the National Green Mobility Program. The government, in collaboration with private energy providers, has announced a joint funding plan to establish 10,000 rapid-charging and battery-swapping hubs along national highways.

The scheme prioritizes high-density urban routes and delivery network corridors. Analysts estimate this will lower charging wait times from hours to under fifteen minutes, eliminating range anxiety for commercial two-wheelers and passenger vehicles.

"Charging infrastructure must precede vehicle demand," an energy economist remarked. "Once vehicle buyers are certain of charging access, market transitions will occur organically." Electric vehicle manufacturers reported a 15% rise in share prices following the statement.`,
    author: "Meera Subramanian",
    source: { name: "Insight Samachar Business" },
    publishedAt: "2026-06-07T10:00:00Z",
    urlToImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
    readingTime: "4 min read"
  }
];

// ─── Category → NewsAPI topic mapping ─────────────────────────────────────────
const CATEGORY_QUERY_MAP = {
  world:         'world news',
  politics:      'politics india',
  business:      'business economy',
  technology:    'technology',
  sports:        'sports',
  entertainment: 'entertainment bollywood',
  science:       'science',
  health:        'health medicine',
  opinion:       'opinion editorial'
};

// ─── CORS Proxy configurations ────────────────────────────────────────────────
// NewsAPI blocks direct browser calls (CORS). Each entry has:
//   buildUrl(apiUrl) → full proxied URL string
//   parseBody(text)  → extract the NewsAPI JSON object from proxy response
const CORS_PROXIES = [
  {
    name: 'allorigins',
    buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    parseBody: (obj) => JSON.parse(obj.contents)   // allorigins wraps in { contents: '...' }
  },
  {
    name: 'corsproxy.io',
    buildUrl: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    parseBody: (obj) => obj                         // returns raw JSON
  },
  {
    name: 'thingproxy',
    buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    parseBody: (obj) => obj                         // returns raw JSON
  }
];

class NewsAPIService {

  constructor() {
    this.apiKey =
      localStorage.getItem(DEFAULT_NEWS_API_KEY_KEY) ||
      '8059cc048c224663ac55a8b6c2697e19';

    this.baseUrl = 'https://newsapi.org/v2';

    // In-memory response cache (key → article array)
    this.cache = {};

    // Track which proxy index is working
    this._proxyIndex = 0;

    // Whether live API returned at least one successful result this session
    this._liveVerified = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────────── */

  /** Set / clear API key */
  setApiKey(key) {
    if (key) {
      this.apiKey = key.trim();
      localStorage.setItem(DEFAULT_NEWS_API_KEY_KEY, this.apiKey);
    } else {
      this.apiKey = null;
      localStorage.removeItem(DEFAULT_NEWS_API_KEY_KEY);
    }
    this.cache = {};
  }

  /** Returns true when a key is configured */
isUsingRealAPI() {

    return this.apiKey &&
    this.apiKey.length > 20;

}

  /**
   * Fetch top headlines.
   * category  – NewsAPI category string OR a mapped topic keyword
   * country   – 2-letter ISO code
   * query     – additional keyword filter
   */
  async fetchTopHeadlines(category = '', country = 'in', query = '') {
    const cacheKey = `headlines-${category}-${country}-${query}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    if (this.isUsingRealAPI()) {
      // Build NewsAPI URL – use /everything with a keyword for niche categories
      // that aren't official NewsAPI categories
      const officialCategories = ['business', 'entertainment', 'general',
        'health', 'science', 'sports', 'technology'];

      let apiUrl;
      if (category && officialCategories.includes(category)) {
        apiUrl = `${this.baseUrl}/top-headlines?apiKey=${this.apiKey}&country=${country}&category=${category}`;
        if (query) apiUrl += `&q=${encodeURIComponent(query)}`;
      } else {
        // For world/politics/opinion – fall back to /everything with keyword
        const keyword = query || CATEGORY_QUERY_MAP[category] || (category || 'india latest');
        apiUrl = `${this.baseUrl}/everything?apiKey=${this.apiKey}&q=${encodeURIComponent(keyword)}&sortBy=publishedAt&language=en&pageSize=50`;
      }

      try {
        const articles = await this._fetchViaProxy(apiUrl);
        const tagged = this._tagArticles(articles, category || 'general');
        this.cache[cacheKey] = tagged;
        this._liveVerified = true;
        return tagged;
      } catch (err) {
        console.warn('[NewsAPI] Live fetch failed, using editorial fallback.', err.message);
        return this._mockDelay(() => this.getMockHeadlines(category, query));
      }
    }

    return this._mockDelay(() => this.getMockHeadlines(category, query));
  }

  /**
   * Full-text search across everything.
   * query – keyword(s) to search
   */
  async fetchEverything(query = '') {
    const cacheKey = `search-${query}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    if (this.isUsingRealAPI()) {
      // When no query, load top Indian headlines as the default feed
      const q = query || 'india';
      const apiUrl = `${this.baseUrl}/everything?apiKey=${this.apiKey}&q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&pageSize=30`;

      try {
        const articles = await this._fetchViaProxy(apiUrl);
        const tagged   = this._tagArticles(articles, query ? 'search' : 'general');
        this.cache[cacheKey] = tagged;
        this._liveVerified   = true;
        return tagged;
      } catch (err) {
        console.warn('[NewsAPI] Search fetch failed, using editorial fallback.', err.message);
        return this._mockDelay(() => this.getMockSearch(query));
      }
    }

    return this._mockDelay(() => this.getMockSearch(query));
  }

  /**
   * Retrieve a single article by ID.
   * Checks mock DB first, then memory cache, then tries to reload its category.
   */
  async fetchArticleById(id) {
    // 1. Mock DB
    const mockMatch = EDITORIAL_MOCK_DATABASE.find(art => art.id === id);
    if (mockMatch) return mockMatch;

    // 2. Memory cache
    for (const key in this.cache) {
      const match = this.cache[key].find(art => art.id === id);
      if (match) return match;
    }

    // 3. Attempt to reload the category pool for live articles
    if (id && id.startsWith('live-')) {
      const parts = id.split('-');
      const category = parts[1] || '';
      try {
        const articles = await this.fetchTopHeadlines(category === 'general' ? '' : category);
        const match = articles.find(art => art.id === id);
        if (match) return match;
      } catch (e) {
        console.error('[NewsAPI] Could not retrieve live article details', e);
      }
    }

    // 4. Safe default
    return EDITORIAL_MOCK_DATABASE[0];
  }

  /* ── Internal helpers ────────────────────────────────────────────────────── */

  /**
   * Try to fetch the NewsAPI URL through available CORS proxies in sequence.
   * Throws on total failure so callers can fall back to mock data.
   */

/**
 * Try to fetch the NewsAPI URL through available CORS proxies in sequence.
 * Throws on total failure so callers can fall back to mock data.
 */
async _fetchViaProxy(apiUrl) {

    let lastError;

    // Rotate so the last-working proxy is tried first
    const indices = [...Array(CORS_PROXIES.length).keys()];

    const order = [
        this._proxyIndex,
        ...indices.filter(i => i !== this._proxyIndex)
    ];

    for (const idx of order) {

        const proxy = CORS_PROXIES[idx];

        try {

            const proxiedUrl = proxy.buildUrl(apiUrl);

            console.log(
                `[NewsAPI] Trying proxy "${proxy.name}"`
            );

            const response = await fetch(proxiedUrl, {

                headers: {
                    Accept: "application/json"
                },

                signal: AbortSignal.timeout
                    ? AbortSignal.timeout(8000)
                    : undefined

            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rawJson = await response.json();

            const data = proxy.parseBody(rawJson);

            if (!data || typeof data !== "object") {
                throw new Error("Proxy returned invalid JSON");
            }

            if (data.status === "error") {
                throw new Error(
                    data.message || data.code
                );
            }

            // Remember working proxy
            this._proxyIndex = idx;

            return Array.isArray(data.articles)
                ? data.articles
                : [];

        } catch (error) {

            console.warn(
                `[Proxy ${proxy.name}] Failed:`,
                error.message
            );

            lastError = error;
        }
    }

    throw lastError || new Error("All CORS proxies failed");

}
  /** Add id, category, readingTime to raw NewsAPI article objects */
 _tagArticles(articles, category) {
    const taggedArticles = articles.map((art, idx) => ({
        ...art,
        id: `live-${category}-${Date.now()}-${idx}`,
        category: art.category || category,

        readingTime: this.calculateReadingTime(
            art.content || art.description || ''
        ),

        urlToImage:
            art.urlToImage ||
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'
    }));
    // Save latest live articles
    localStorage.setItem(
        "latest_articles",
        JSON.stringify(taggedArticles)
    );
    return taggedArticles;
}

  /** Wrap mock result with a short delay for loading animation realism */
  _mockDelay(fn) {
    return new Promise(resolve => setTimeout(() => resolve(fn()), 500));
  }

  /* ── Mock helpers ────────────────────────────────────────────────────────── */

  getMockHeadlines(category = '', query = '') {
    let dataset = [...EDITORIAL_MOCK_DATABASE];
    if (category) {
      dataset = dataset.filter(art => art.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      dataset = dataset.filter(art =>
        art.title.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q)
      );
    }
    return dataset;
  }

  getMockSearch(query = '') {
    // First try cached live articles
    const cache = JSON.parse(
        localStorage.getItem("latest_articles") || "[]"
    );
    if (cache.length > 0) {
       if (!query) {
            return cache;
        }
        const q = query.toLowerCase();
        return cache.filter(article =>
            (article.title || "").toLowerCase().includes(q) ||
            (article.description || "").toLowerCase().includes(q) ||
            (article.content || "").toLowerCase().includes(q) ||
            (article.category || "").toLowerCase().includes(q)
        );
    }
    // Fallback to editorial articles
    if (!query) {
        return EDITORIAL_MOCK_DATABASE;
    }
    const q = query.toLowerCase();
    return EDITORIAL_MOCK_DATABASE.filter(article =>
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)
    );

}

calculateReadingTime(text) {

    if (!text) return "2 min read";

    const words =
        text.replace(/\[.*?\]/g, "")
            .split(/\s+/)
            .filter(Boolean).length;

    return `${Math.max(1,
        Math.ceil(words / 200)
    )} min read`;

}
}
// Export single instance globally
const apiService = new NewsAPIService();
window.apiService = apiService;
window.EDITORIAL_MOCK_DATABASE = EDITORIAL_MOCK_DATABASE;
