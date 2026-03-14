export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  longDescription?: string;
  price: number;
  features?: string[];
  image?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Organic Fertilizer",
    category: "Fertilizers",
    description: "Rich in nutrients for healthy plant growth.",
    longDescription: "Our premium organic fertilizer is carefully balanced to provide your crops with everything they need for explosive, healthy growth. Derived from natural sources, it improves soil structure while feeding your plants.",
    price: 25.99,
    features: ["100% Organic", "Slow-release formula", "Improves soil health", "Safe for all edibles"],
    image: 'https://images.unsplash.com/photo-1585255476717-b08e7529f7cf?w=500&q=80'
  },
  {
    id: 2,
    name: "Neem Oil Pesticide",
    category: "Pesticides",
    description: "Natural protection against common garden pests.",
    longDescription: "Protect your harvest naturally with our cold-pressed neem oil. It acts as an insecticide, miticide, and fungicide all in one, while remaining safe for beneficial insects like bees and ladybugs.",
    price: 15.49,
    features: ["Cold-pressed", "OMRI listed", "Broad-spectrum control", "Leaves no harmful residue"],
    image: 'https://images.unsplash.com/photo-1611735341450-74d112a2cb87?w=500&q=80'
  },
  {
    id: 3,
    name: "Tomato Seeds",
    category: "Seeds",
    description: "High-yield, disease-resistant tomato seeds.",
    longDescription: "These indeterminate heirloom seeds have been selected for heavy yields and excellent disease resistance. Expect large, flavorful, deep-red slicing tomatoes perfect for fresh eating or canning.",
    price: 4.99,
    features: ["Heirloom variety", "Indeterminate growth", "High germination rate", "Non-GMO"],
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80'
  },
  {
    id: 4,
    name: "Drip Irrigation Kit",
    category: "Equipment",
    description: "Water-saving irrigation system for your farm.",
    longDescription: "Conserve water and target your plants' root zones directly. This comprehensive kit includes everything you need to set up a professional-grade drip system for raised beds or row crops.",
    price: 89.99,
    features: ["Saves up to 70% water", "Easy snap-on fittings", "UV-resistant tubing", "Includes timer"],
    image: 'https://images.unsplash.com/photo-1416879598555-46aaca8edb68?w=500&q=80'
  },
  {
    id: 5,
    name: "Compost Bin",
    category: "Equipment",
    description: "Large capacity bin for organic waste composting.",
    longDescription: "Turn your farm and kitchen waste into black gold. This durable, dual-chamber tumbling composter speeds up the decomposition process, yielding rich compost in mere weeks.",
    price: 45.00,
    features: ["Dual-chamber design", "Tumbling mechanism", "Aeration holes", "Pest-resistant"],
    image: 'https://images.unsplash.com/photo-1582218084656-34a8e2b83416?w=500&q=80'
  },
  {
    id: 6,
    name: "NPK 19-19-19",
    category: "Fertilizers",
    description: "Balanced fertilizer for all-around plant health.",
    longDescription: "A perfectly balanced 19-19-19 water-soluble fertilizer designed for rapid greening and robust flower/fruit development. Ideal for greenhouse and field crops alike.",
    price: 30.00,
    features: ["Water-soluble", "Fast-acting", "Micronutrients included", "Won't burn roots"],
    image: 'https://images.unsplash.com/photo-1581093125633-8a35eeadab80?w=500&q=80'
  },
  {
    id: 7,
    name: "Carrot Seeds",
    category: "Seeds",
    description: "Crisp and sweet carrot variety for easy growing.",
    longDescription: "Our Nantes variety carrot seeds produce cylindrical, nearly coreless carrots that are exceptionally sweet and crisp. They perform well even in heavier soils.",
    price: 3.99,
    features: ["Nantes variety", "Fast maturing (65 days)", "High vitamin A", "Stores well"],
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80'
  },
  {
    id: 8,
    name: "Fungicide Spray",
    category: "Pesticides",
    description: "Effective control of fungal diseases on crops.",
    longDescription: "A systemic copper-based fungicide that provides long-lasting preventative control against powdery mildew, blight, rust, and other common agricultural fungal infections.",
    price: 18.50,
    features: ["Copper-based", "Rain-fast after 2 hours", "Preventative action", "Concentrated formula"],
    image: 'https://images.unsplash.com/photo-1628556606822-793db5e82b7b?w=500&q=80'
  },
];
