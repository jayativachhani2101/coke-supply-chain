// Coca-Cola Global Bottlers and Supply Chain Data
const COKE_DATA = {
  headquarters: {
    name: "The Coca-Cola Company Global Headquarters",
    address: "One Coca-Cola Plaza, Atlanta, Georgia, USA",
    coords: [33.7715, -84.4015],
    established: 1886,
    founder: "Dr. John S. Pemberton",
    employees: "Approx. 8,000+ at HQ Campus",
    description: "Nestled in the heart of Atlanta, the 35-acre headquarters campus serves as the global strategic center for the world's most recognized beverage brand. It is here that the secret Coca-Cola formula is securely stewarded, and the global brand strategy, syrup concentrate production licensing, and marketing are orchestrated.",
    highlights: [
      "Staged on a sprawling modern campus featuring research labs, the Coca-Cola archives, and executive offices.",
      "Maintains overall brand equity, trademark licensing, and concentrate supply to authorized bottlers globally.",
      "Designed with highly sustainable LEED-certified building practices, green rooftops, and zero-waste initiatives."
    ]
  },

  regions: {
    "north-america": {
      name: "North America",
      color: "#FF3366", // Neon Coral Red
      description: "Representing Coca-Cola's birth market, this region stands at the forefront of packaging innovation, direct-store delivery logistics, and premium cold-drink equipment execution.",
      share: "30% of global volume"
    },
    "latin-america": {
      name: "Latin America",
      color: "#FF9F1C", // Neon Amber Orange
      description: "One of the highest per-capita consumption regions in the world, marked by massive returns-packaging systems and extensive mom-and-pop retail distribution networks.",
      share: "28% of global volume"
    },
    "europe": {
      name: "Europe & Central Asia",
      color: "#4CC9F0", // Neon Sky Blue
      description: "Leader in advanced net-zero carbon operations, fully integrated digital supply chains, and pioneer in 100% recycled PET (rPET) plastic packaging solutions.",
      share: "18% of global volume"
    },
    "africa-me": {
      name: "Africa & Middle East",
      color: "#F72585", // Neon Pink
      description: "A fast-growing region with a focus on local job creation, micro-distribution centers (MDCs) empowering local entrepreneurs, and extensive water stewardship programs.",
      share: "11% of global volume"
    },
    "asia-pacific": {
      name: "Asia-Pacific",
      color: "#72EFDD", // Electric Mint Cyan
      description: "A highly diverse, massive consumer footprint utilizing hyper-automated smart warehouses, ultra-fast regional distribution channels, and localized custom flavors.",
      share: "13% of global volume"
    }
  },

  bottlers: [
    {
      id: "coca-cola-consolidated",
      name: "Coca-Cola Consolidated, Inc.",
      region: "north-america",
      hq: "Charlotte, North Carolina, USA",
      coords: [35.2271, -80.8431],
      established: 1902,
      plants: 13,
      distributionCenters: 60,
      employees: 17000,
      description: "The largest independent Coca-Cola bottler in the United States, operating across 14 states and the District of Columbia. Known for a highly automated product distribution network and advanced regional sales center operations.",
      initiatives: "Advanced hybrid-fleet transportation, massive regional water reclamation projects, and local youth employment opportunities."
    },
    {
      id: "coca-cola-swires-usa",
      name: "Swire Coca-Cola, USA",
      region: "north-america",
      hq: "Draper, Utah, USA",
      coords: [40.5247, -111.8638],
      established: 1978,
      plants: 6,
      distributionCenters: 37,
      employees: 7200,
      description: "Serves millions of consumers across 13 western US states. Part of the global Swire Group, they boast state-of-the-art high-speed production lines and high-altitude desert shipping expertise.",
      initiatives: "100% water replenishment target achieved ahead of schedule, solar-powered distribution hubs, and significant plastic reduction in wrap packaging."
    },
    {
      id: "coca-cola-femsa",
      name: "Coca-Cola FEMSA",
      region: "latin-america",
      hq: "Mexico City, Mexico",
      coords: [19.4326, -99.1332],
      established: 1993,
      plants: 56,
      distributionCenters: 249,
      employees: 83000,
      description: "The largest franchise bottler of Coca-Cola in the world by sales volume. Serving over 270 million consumers across Mexico, Central America, Colombia, Brazil, and Uruguay. They manage a highly complex logistics chain of over 2.1 million points of sale.",
      initiatives: "Industry 4.0 'Smart Bottling Plant' model, closed-loop circular economy using 100% food-grade PET recycling facilities, and extensive public water access projects."
    },
    {
      id: "arca-continental",
      name: "Arca Continental",
      region: "latin-america",
      hq: "Monterrey, Mexico",
      coords: [25.6866, -100.3161],
      established: 2001,
      plants: 45,
      distributionCenters: 110,
      employees: 64000,
      description: "The second-largest Coca-Cola bottler in Latin America and one of the largest globally. Operates in Mexico, Ecuador, Peru, Argentina, and parts of the United States (Texas, New Mexico, Oklahoma). Pioneers in intensive direct-to-retailer handheld ERP technology.",
      initiatives: "PetStar—the world's largest food-grade PET recycling plant (joint venture), massive industrial energy-efficiency certifications, and sustainable small-business training."
    },
    {
      id: "ccep",
      name: "Coca-Cola Europacific Partners (CCEP)",
      region: "europe",
      hq: "Uxbridge, United Kingdom",
      coords: [51.5430, -0.4760],
      established: 2016,
      plants: 79,
      distributionCenters: 85,
      employees: 42000,
      description: "A leading consumer goods company and the largest independent Coca-Cola bottler globally by revenue. Spanning 29 countries across Western Europe, Australia, New Zealand, the Pacific Islands, and Indonesia. Leaders in cutting-edge digital twins and high-speed carbonation lines.",
      initiatives: "100% renewable electricity commitment, net-zero greenhouse gas emissions by 2040, transitioned all plastic bottles in Western Europe to 100% rPET, and innovative tethered caps to ease recycling."
    },
    {
      id: "cchbc",
      name: "Coca-Cola Hellenic Bottling Company",
      region: "europe",
      hq: "Zug, Switzerland",
      coords: [47.1662, 8.5155],
      established: 1969,
      plants: 56,
      distributionCenters: 280,
      employees: 33000,
      description: "Serves over 700 million people across 29 countries in three continents (extending from Ireland to Eastern Europe, Russia, and Nigeria). Operates some of the fastest automated warehouse systems in the industry.",
      initiatives: "Consistently ranked as Europe's most sustainable beverage company by the Dow Jones Sustainability Index, with major investments in water-saving dry sanitation lines."
    },
    {
      id: "ccba",
      name: "Coca-Cola Beverages Africa (CCBA)",
      region: "africa-me",
      hq: "Port Elizabeth, South Africa",
      coords: [-33.9608, 25.6022],
      established: 2016,
      plants: 39,
      distributionCenters: 42,
      employees: 16000,
      description: "The largest Coca-Cola bottler on the African continent, serving 14 sub-Saharan African countries and accounting for over 40% of all Coca-Cola volumes sold in Africa. Known for specialized micro-distribution routes.",
      initiatives: "Over 3,000 Micro-Distribution Centers empowering youth and female micro-entrepreneurs, localized solar-powered bottling cells, and highly targeted community boreholes."
    },
    {
      id: "coca-cola-bottlers-japan",
      name: "Coca-Cola Bottlers Japan Inc.",
      region: "asia-pacific",
      hq: "Tokyo, Japan",
      coords: [35.6762, 139.6503],
      established: 2017,
      plants: 17,
      distributionCenters: 320,
      employees: 15000,
      description: "Consolidated major Japanese bottlers to cover approximately 88% of the Japanese market. Employs advanced robotics and artificial intelligence to manage Japan's dense, high-frequency vending machine logistics.",
      initiatives: "Hyper-automated AI inventory routing, carbon-neutral manufacturing certifications, and intensive packaging reduction utilizing Japan's ultra-light glass bottle designs."
    },
    {
      id: "swire-coke-china",
      name: "Swire Coca-Cola (Greater China)",
      region: "asia-pacific",
      hq: "Hong Kong",
      coords: [22.3193, 114.1694],
      established: 1965,
      plants: 25,
      distributionCenters: 120,
      employees: 22000,
      description: "One of the primary bottlers in Greater China, managing extensive franchise territories across mainland China, Taiwan, and Hong Kong. Utilizes high-efficiency distribution systems supplying massive urban mega-cities.",
      initiatives: "Smart digital pipeline monitoring, massive investments in heat pump water recovery, and a completely electrified city delivery truck fleet in major test zones."
    }
  ],

  supplyChainSteps: [
    {
      step: 1,
      title: "Concentrate Sourcing",
      subtitle: "The Master Secret Formulation",
      icon: "flask",
      description: "The journey begins with the precision blending of highly guarded, concentrated ingredients at advanced corporate manufacturing facilities. This secret formula is distributed to regional bottling partners worldwide.",
      details: [
        "Raw ingredients are sourced under rigid ethical and quality standards globally.",
        "Concentrate syrups are formulated in a dry/liquid base to protect the intellectual formula.",
        "Precision shipping systems deliver the concentrate globally with micro-controlled thermal logs.",
        "This concentrate represents the brand equity, ensuring identical taste in 200+ countries."
      ]
    },
    {
      step: 2,
      title: "Water Filtration & Syrup Prep",
      subtitle: "Securing Pure Ingredients Locally",
      icon: "droplet",
      description: "Local bottlers receive the concentrate and mix it with high-purity local ingredients. Water undergoes intensive multi-barrier filtration to ensure a standard of molecular purity.",
      details: [
        "Local municipal water is filtered via carbon beds, reverse osmosis, and ultraviolet sterilization.",
        "Pristine filtered water is blended with local sweeteners (cane sugar or beet sugar) to create simple syrup.",
        "Secret concentrate is combined with simple syrup to create the final beverage syrup.",
        "Automated gas-liquid contactors carbonate the beverage under pressurized carbon dioxide (CO2)."
      ]
    },
    {
      step: 3,
      title: "Precision Bottling & Packaging",
      subtitle: "High-Speed Automation in Action",
      icon: "package",
      description: "Sterile bottles (recycled PET, glass, or aluminum cans) enter high-speed monobloc lines where they are blown, washed, filled, capped, and inspected at up to 100,000 containers per hour.",
      details: [
        "Preforms are blow-molded on-site into finalized PET plastic bottles using high-pressure air.",
        "Containers are sanitized, double-rinsed, and precision filled with carbonated soda at near-freezing temperatures.",
        "Crown caps or screw closures are sealed in milliseconds to lock in carbonation pressure.",
        "Sophisticated electronic vision inspectors reject any under-filled or mislabeled packages."
      ]
    },
    {
      step: 4,
      title: "Smart Logistics & Transport",
      subtitle: "Dynamic Routing to Global Retailers",
      icon: "truck",
      description: "Coded pallets are transported to fully automated high-bay warehouses where robots organize inventory. Electric or clean-diesel fleets deliver the beverages to millions of stores, restaurants, and vending machines.",
      details: [
        "Warehouse execution systems (WES) coordinate automated laser-guided vehicles (AGVs) for pallet loading.",
        "Dynamic logistics algorithms optimize shipping routes to reduce fuel burn and carbon emissions.",
        "Direct-to-store distribution programs route beverages to hypermarkets down to micro-retail centers.",
        "Vending machines equipped with telemetry report live stock data to delivery drivers in real-time."
      ]
    },
    {
      step: 5,
      title: "Consumer Joy & Circular Recycling",
      subtitle: "Completing the Sustainable Loop",
      icon: "refresh-cw",
      description: "The product is purchased and enjoyed. Coca-Cola works alongside global bottlers to ensure a 'World Without Waste' by recovering and recycling 100% of equivalent packaging by 2030.",
      details: [
        "Beverages are chilled and enjoyed by millions of consumers daily, providing refreshing moments.",
        "Post-consumer bottles are collected via deposit schemes and reverse vending machines.",
        "Used PET is sorted, crushed, washed, and pelletized back into pristine food-grade rPET.",
        "The recycled pellets are reused in Step 3 preform blow-molding, completing a carbon-efficient circular loop."
      ]
    }
  ]
};
