// CoinGecko API utilities
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Helper function to handle CORS headers
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Fallback data for different endpoints
export const FALLBACK_DATA = {
  '/global': {
    data: {
      active_cryptocurrencies: 10991,
      upcoming_icos: 0,
      ongoing_icos: 49,
      ended_icos: 3376,
      markets: 913,
      total_market_cap: {
        btc: 41909165.76478655,
        eth: 643594005.1533328,
        ltc: 17520630978.93865,
        bch: 5127113246.509362,
        bnb: 5095613613.892762,
        eos: 1666367895583.2534,
        xrp: 2284123973150.0015,
        xlm: 11121582078141.775,
        link: 96891268881.44727,
        dot: 252669331534.7325,
        yfi: 186442551.87026513,
        usd: 3096767863518.2095,
        aed: 11378170347414.59,
        ars: 2739204694073440,
        aud: 4753517664773.177,
        bdt: 339892850151825.6,
        bhd: 1164831479095.1086,
        bmd: 3096767863518.2095,
        brl: 15804513855649.064,
        cad: 4241520984252.8003,
        chf: 2801055621664.8447,
        clp: 2999055444053158.5,
        cny: 22452217380294.06,
        czk: 72342953059294.05,
        dkk: 21559042927293.9,
        eur: 2890289471526.1187,
        gbp: 2461290784918.731,
        hkd: 24196551635742.797,
        huf: 1139584214865624.8,
        idr: 50116693752841760,
        ils: 11370639855736.582,
        inr: 259149764784878.5,
        jpy: 483642559193142.75,
        krw: 4214773518809432,
        kwd: 954006536845.5975,
        lkr: 925055290564923,
        mmk: 6483599391644747,
        mxn: 51872797204325.38,
        myr: 14569652520598.848,
        ngn: 4867827118324850,
        nok: 33434245536397.062,
        nzd: 5128242353532.845,
        php: 177532831358048.38,
        pkr: 863635865862927.1,
        pln: 12338520635566.725,
        rub: 282911211635115.4,
        sar: 11617379321539.334,
        sek: 33084075795057.51,
        sgd: 4175193242969.5186,
        thb: 113602324864668.22,
        try: 100098069387265.1,
        twd: 100350694891090.34,
        uah: 123285001219826.47,
        vef: 309895833401.36896,
        vnd: 79149023397456112,
        zar: 56785761839109.52,
        xdr: 2338193752055.7583,
        xag: 127122097824.05554,
        xau: 1532123906.6262126,
        bits: 41909165764786.55,
        sats: 4190916576478655
      },
      total_volume: {
        btc: 1848051.1962284928,
        eth: 28383232.43621063,
        ltc: 772724726.0473666,
        bch: 226115064.10929495,
        bnb: 224719975.7384909,
        eos: 73488248493.59108,
        xrp: 100728941486.72337,
        xlm: 490597649851.0834,
        link: 4272751252.0646925,
        dot: 11144431249.70765,
        yfi: 8222217.539481658,
        usd: 136600000000.00003,
        aed: 501762300005.43207,
        ars: 120777064879456.89,
        aud: 209602433626.89856,
        bdt: 14991731708097.545,
        bhd: 51378118903.77559,
        bmd: 136600000000.00003,
        brl: 696843979998.1909,
        cad: 187033693983.84387,
        chf: 123527825487.01332,
        clp: 132256619800975.78,
        cny: 990033001644.53,
        czk: 3190625428644.8833,
        dkk: 950803456465.5518,
        eur: 127484992245.80223,
        gbp: 108564069999.66594,
        hkd: 1067228051979.9808,
        huf: 50257293999911.695,
        idr: 2210300000000000,
        ils: 501428209999.7705,
        inr: 11428999999711.932,
        jpy: 21327999927234.86,
        krw: 185900000000000,
        kwd: 42079199998.90143,
        lkr: 40798399977874.664,
        mmk: 285930000000000,
        mxn: 2288000064696.6997,
        myr: 642460000002.6353,
        ngn: 214649999999913.8,
        nok: 1474399993978.1438,
        nzd: 226160000000.05682,
        php: 7829099999904.75,
        pkr: 38082399999797.836,
        pln: 544209999973.53,
        rub: 12476999997578.402,
        sar: 512389999964.86926,
        sek: 1459199999947.3193,
        sgd: 184159999997.85608,
        thb: 5010499999958.67,
        try: 4414500000011.2,
        twd: 4425599999976.32,
        uah: 5437799999960.129,
        vef: 13668900008.19762,
        vnd: 3490699999958016,
        zar: 2504699999958.9897,
        xdr: 103129999996.32277,
        xag: 5606699999.962168,
        xau: 67574.99999982746,
        bits: 1848051196228.4927,
        sats: 184805119622849.28
      },
      market_cap_percentage: {
        btc: 54.94557596189251,
        eth: 13.72613586066814,
        usdt: 3.0339837321804106,
        sol: 2.7561998960505477,
        bnb: 2.0493833334461634,
        xrp: 1.3366825433855353,
        steth: 1.132442493873401,
        usdc: 1.0929380040851708,
        ada: 0.7810196903528539,
        ton: 0.5809023517767798
      },
      market_cap_change_percentage_24h_usd: 1.1859912424578046,
      updated_at: 1711831865
    }
  },
  '/coins/markets': [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
      current_price: 71123,
      market_cap: 1396985037877,
      market_cap_rank: 1,
      fully_diluted_valuation: 1493100541492,
      total_volume: 19749307707,
      high_24h: 71677,
      low_24h: 69770,
      price_change_24h: 1221.25,
      price_change_percentage_24h: 1.74661,
      market_cap_change_24h: 25196599642,
      market_cap_change_percentage_24h: 1.83833,
      circulating_supply: 19652568,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 73738,
      ath_change_percentage: -3.47419,
      ath_date: "2024-03-14T07:08:32.566Z",
      atl: 67.81,
      atl_change_percentage: 104788.93297,
      atl_date: "2013-07-06T00:00:00.000Z",
      roi: null,
      last_updated: "2024-03-31T01:29:49.129Z"
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
      current_price: 3588.58,
      market_cap: 431212984418,
      market_cap_rank: 2,
      fully_diluted_valuation: 431212984418,
      total_volume: 9840172733,
      high_24h: 3626.01,
      low_24h: 3534.66,
      price_change_24h: 26.1,
      price_change_percentage_24h: 0.73207,
      market_cap_change_24h: 3413023825,
      market_cap_change_percentage_24h: 0.7982,
      circulating_supply: 120164592.266881,
      total_supply: 120164592.266881,
      max_supply: null,
      ath: 4878.26,
      ath_change_percentage: -26.41865,
      ath_date: "2021-11-10T14:24:19.604Z",
      atl: 0.432979,
      atl_change_percentage: 828887.31472,
      atl_date: "2015-10-20T00:00:00.000Z",
      roi: {
        times: 87.45799162459367,
        currency: "btc",
        percentage: 8745.799162459366
      },
      last_updated: "2024-03-31T01:29:57.961Z"
    }
  ],
  '/coins/top_gainers_losers': {
    "gainers": [
      {
        "id": "pepe",
        "symbol": "pepe",
        "name": "Pepe",
        "image": "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696526602",
        "current_price": 0.00001123,
        "market_cap": 4722570827,
        "market_cap_rank": 23,
        "fully_diluted_valuation": null,
        "total_volume": 2163289282,
        "high_24h": 0.00001188,
        "low_24h": 0.00000901,
        "price_change_24h": 0.00000222,
        "price_change_percentage_24h": 24.5763,
        "market_cap_change_24h": 926923781,
        "market_cap_change_percentage_24h": 24.42677,
        "circulating_supply": 420689999999,
        "total_supply": 420690000000000000,
        "max_supply": null,
        "ath": 0.00001141,
        "ath_change_percentage": -1.86687,
        "ath_date": "2024-03-31T00:49:39.858Z",
        "atl": 0.00000043,
        "atl_change_percentage": 2541.29333,
        "atl_date": "2023-05-06T09:22:55.314Z",
        "roi": null,
        "last_updated": "2024-03-31T01:19:19.882Z",
        "price_change_percentage": 24.5763
      },
      {
        "id": "dogecoin",
        "symbol": "doge",
        "name": "Dogecoin",
        "image": "https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1696501409",
        "current_price": 0.199337,
        "market_cap": 28801788353,
        "market_cap_rank": 10,
        "fully_diluted_valuation": null,
        "total_volume": 6031111776,
        "high_24h": 0.211216,
        "low_24h": 0.166461,
        "price_change_24h": 0.0328766,
        "price_change_percentage_24h": 19.76227,
        "market_cap_change_24h": 4722659906,
        "market_cap_change_percentage_24h": 19.61598,
        "circulating_supply": 144306245812.134,
        "total_supply": null,
        "max_supply": null,
        "ath": 0.731578,
        "ath_change_percentage": -72.75328,
        "ath_date": "2021-05-08T05:08:23.458Z",
        "atl": 0.0000869,
        "atl_change_percentage": 229489.96499,
        "atl_date": "2015-05-06T00:00:00.000Z",
        "roi": null,
        "last_updated": "2024-03-31T01:19:31.118Z",
        "price_change_percentage": 19.76227
      }
    ],
    "losers": [
      {
        "id": "havven",
        "symbol": "snx",
        "name": "Synthetix Network",
        "image": "https://assets.coingecko.com/coins/images/3406/large/SNX.png?1698233330",
        "current_price": 3.5,
        "market_cap": 1131622359,
        "market_cap_rank": 93,
        "fully_diluted_valuation": 1313407522,
        "total_volume": 100080354,
        "high_24h": 3.73,
        "low_24h": 3.33,
        "price_change_24h": -0.227891,
        "price_change_percentage_24h": -6.11701,
        "market_cap_change_24h": -73831257.70178223,
        "market_cap_change_percentage_24h": -6.12632,
        "circulating_supply": 323045807.365488,
        "total_supply": 374922981.765398,
        "max_supply": null,
        "ath": 28.77,
        "ath_change_percentage": -87.8271,
        "ath_date": "2021-02-14T01:12:38.505Z",
        "atl": 0.0347864,
        "atl_change_percentage": 9954.18893,
        "atl_date": "2019-01-06T00:00:00.000Z",
        "roi": {
          "times": 2.7231421246001735,
          "currency": "usd",
          "percentage": 272.31421246001733
        },
        "last_updated": "2024-03-31T01:18:58.797Z",
        "price_change_percentage": -6.11701
      },
      {
        "id": "gmx",
        "symbol": "gmx",
        "name": "GMX",
        "image": "https://assets.coingecko.com/coins/images/18323/large/arbit.png?1631532468",
        "current_price": 53.81,
        "market_cap": 522724932,
        "market_cap_rank": 125,
        "fully_diluted_valuation": 522724932,
        "total_volume": 20143275,
        "high_24h": 57.15,
        "low_24h": 53.38,
        "price_change_24h": -3.33,
        "price_change_percentage_24h": -5.83186,
        "market_cap_change_24h": -32413811.77986145,
        "market_cap_change_percentage_24h": -5.84014,
        "circulating_supply": 9704659.0808472,
        "total_supply": 9705676.32391397,
        "max_supply": null,
        "ath": 85.58,
        "ath_change_percentage": -37.12489,
        "ath_date": "2023-07-29T22:27:51.214Z",
        "atl": 5.13,
        "atl_change_percentage": 949.57743,
        "atl_date": "2021-12-29T15:25:00.511Z",
        "roi": null,
        "last_updated": "2024-03-31T01:25:55.818Z",
        "price_change_percentage": -5.83186
      }
    ]
  },
  '/coins/categories': [
    {
      "id": "ethereum-ecosystem",
      "name": "Ethereum Ecosystem",
      "market_cap": 833968775761.1108,
      "market_cap_change_24h": 0.8923981308338417,
      "content": "",
      "top_3_coins": [
        "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1696501628",
        "https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694",
        "https://assets.coingecko.com/coins/images/325/small/Tether.png?1696501661"
      ],
      "volume_24h": 24989090087.8895,
      "updated_at": "2024-03-30T23:35:11.607Z"
    },
    {
      "id": "blockchain-service",
      "name": "Blockchain Service",
      "market_cap": 66683747444.88594,
      "market_cap_change_24h": 0.6687651128493177,
      "content": "",
      "top_3_coins": [
        "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg?1696520358",
        "https://assets.coingecko.com/coins/images/24488/small/gno.png?1696524900",
        "https://assets.coingecko.com/coins/images/11085/small/Trust.png?1696508950"
      ],
      "volume_24h": 1089963471.2752895,
      "updated_at": "2024-03-30T23:35:29.245Z"
    }
  ]
};

// Helper function to make API requests with error handling
export async function fetchCoinGeckoAPI(endpoint: string, params: Record<string, string | undefined> = {}) {
  // Filter out undefined params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  );
  
  // Build URL with query parameters
  const url = new URL(`${COINGECKO_API_URL}${endpoint}`);
  Object.entries(filteredParams).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  
  // Get API key from environment variable
  const apiKey = process.env.COINGECKO_API_KEY || '';
  
  try {
    console.log(`Fetching CoinGecko API: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'x-cg-pro-api-key': apiKey,
      },
      // Set a reasonable timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} - ${errorText}`);
      
      // Return fallback data if available
      if (FALLBACK_DATA[endpoint]) {
        console.log(`Using fallback data for ${endpoint}`);
        return FALLBACK_DATA[endpoint];
      }
      
      // For specific endpoints with dynamic IDs, use generic fallback
      if (endpoint.startsWith('/coins/markets')) {
        console.log(`Using fallback market data`);
        return FALLBACK_DATA['/coins/markets'];
      }
      
      throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from CoinGecko API: ${error}`);
    
    // Return fallback data if available
    if (FALLBACK_DATA[endpoint]) {
      console.log(`Using fallback data for ${endpoint} after error`);
      return FALLBACK_DATA[endpoint];
    }
    
    // For specific endpoints with dynamic IDs, use generic fallback
    if (endpoint.startsWith('/coins/markets')) {
      console.log(`Using fallback market data after error`);
      return FALLBACK_DATA['/coins/markets'];
    }
    
    throw error;
  }
}

// Handle OPTIONS requests for CORS preflight
export function handleOptions() {
  return new Response(null, {
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
    status: 204,
  });
}

// Handle errors in a consistent way
export function handleError(error: Error) {
  console.error('API Error:', error);
  return new Response(
    JSON.stringify({
      error: error.message || 'An unexpected error occurred',
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
} 