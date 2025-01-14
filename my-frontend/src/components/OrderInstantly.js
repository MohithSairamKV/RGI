import React, { useState, useEffect } from 'react';
import OrderInstantlyHeader from './OrderInstantlyHeader';
import ProductOrderPopup from './ProductOrderPopup'; // Import the ProductOrderPopup

const OrderInstantly = () => {
  const [step, setStep] = useState('storeSelection'); // Manage selection steps
  const [storeName, setStoreName] = useState(''); // Selected store
  const [storeSearch, setStoreSearch] = useState(''); // Search term for stores
  const [storeSuggestions, setStoreSuggestions] = useState([]); // Filtered stores
  const [products, setProducts] = useState([]); // Fetched products
  const [searchTerm, setSearchTerm] = useState(''); // Product search term
  const [selectedBrand, setSelectedBrand] = useState(''); // Selected brand filter
  const [popupVisible, setPopupVisible] = useState(false); // Show/hide popup
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for popup

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const stores = [
    "7-ELEVEN #14354",
"7-ELEVEN #14396",
"7-ELEVEN #22625",
"7-ELEVEN #23895",
"7-ELEVEN #29078",
"7-ELEVEN #37134",
"7-ELEVEN #37755A",
"7-ELEVEN #38365A",
"ADDIS MARKET LLC",
"ANNAPURANA BROADWAY",
"AZMERA MARKET",
"BOMBAY BURGER",
"BOMBAY EXPRESS",
"CENTRAL MARKET-SL",
"CHAMAN ENTERPRISES",
"CHUTNEYS BRISTO",
"CONTINENTAL SPICES NEW",
"DAAWAT GRILL",
"FACEBOOK-Like Place",
"FACEBOOK-Whole Enchlida",
"GARAM MASALA",
"GYRO HOUSE INC.",
"HALAL BITES",
"HANUMAN NAGRI TEMPLE",
"HARAMBE MARKET",
"HMART DENNY WAY CORP DBA DISTRICT H",
"HMART SEATTLE",
"INDIA BISTRO",
"INDIA BISTRO(NW MARKE, SEA",
"INDIAN SWEET & SPICES",
"KASTOORI GRILL",
"KATHMANDU  MOMOCHA",
"KOTTU LLC",
"LENNY'S PRODUCE",
"LIDETTA MARKET",
"M2M MART CORP DBA M2M MART",
"MAGGI POINT",
"MAHARAJA WEST",
"MASALA OF INDIA CUISINE SEATTLE",
"MIRCH MASALA CUISINE OF INDIA",
"MOTHER INDIA CUISINE",
"PIZZA TWIST ROOSEVELT",
"PIZZA TWIST UNY NEW",
"PRIDE INDIA GROCERIE",
"RAHAMA CLOTHING & JEWELLERY",
"RJ PLAZA",
"RUHAMAH LLC",
"SAFFRON GRILL",
"SANGAMAM",
"SHER E PUNJAB",
"SHOLLA MARKET LLC",
"SINGH AND SINGH PETRO",
"SPICE ON CURVE",
"SPICE SPC",
"SRI BELLA FOODS",
"SUPER SAVER FOODS GREEN WOOD",
"TANDOORI HUT",
"TASTE OF INDIA",
"THE SOUK",
"U-DISTRICT GROCERY",
"URBAN MART LLC",
"7-ELEVEN #17355",
"7-ELEVEN #21464",
"7-ELEVEN #23559",
"7-ELEVEN #37558",
"AMAZON GRACE, SUMIT 3",
"AMULYA INDIAN CUISINE",
"APNA BAZAAR (SAMMAMISH)",
"APNA BAZAR",
"BANARAS BELLEVUE",
"CAFE BOLLYWOOD",
"CHAT HOUSE",
"CHUTNEYS OF BELLEVUE",
"DESI TADKA BELLEVUE",
"FACEBOOK-Homestead Café ",
"FACEBOOK-Bellevue Crashpad Café",
"FACEBOOK-Showcase Café",
"FACEBOOK-RAD",
"FACEBOOK-The Grail",
"FARZI CAFE",
"HALAL MEAT",
"HILTON BELLEVUE",
"HOMENEEDS INC",
"HONEST RESTAURANT",
"INDIA GATE RESTAURANT",
"INDIA HYPER MART",
"INDIA SUPER MARKET WA",
"INTERNATIONAL FOOD BAZAR(BELLEVUE)",
"KHUSHI RESTAURANT",
"LOVES'S YUMMY CUISINE",
"MADRAS DOSA CORNER",
"MAHARAJA ISSAQUAH",
"MANTRA LLC",
"MASTHI BAR &GRILL",
"MAURYA GROCERY",
"MOMMY'S KITCHEN LLC",
"MUSTAFA",
"NAAN N CURRY ISSAQUAH",
"NIK FOODS LLC",
"QFC BELLEVUE (DOWNTOWN - VILLAGE CENTER)",
"QFC STORE #826",
"QFC STORE #827",
"QFC STORE #874",
"RAJDHANI",
"ROSE MARKET",
"SAYURI",
"SWEET LADY FOODS LLC",
"THE ROLL POD",
"VRINDAAVAN",
"WILD GINGER",
"19TH ST GROCERY & DELI",
"786 MARKET",
"7-ELEVEN #16319F",
"7-ELEVEN #20188E",
"7-ELEVEN #21776",
"7-ELEVEN #27030",
"7-ELEVEN #27283",
"7-ELEVEN #27311",
"7-ELEVEN #32308",
"7-ELEVEN #35334A",
"7-ELEVEN #38597",
"7-ELEVEN #38700A",
"7-ELEVEN #38806",
"7-ELEVEN BOONEY LAKE",
"7-ELEVEN FEDERAL WAY",
"7-ELEVEN KENT",
"7-ELEVEN SEATAC15525",
"AASTHA INDIAN CUISINE",
"AFGHAN CUISINE KENT",
"AFRAN MARKET",
"AFSHAAR BAKERY",
"AL-BARAWI INTL FOOD MKT",
"ALHAMDANI",
"ALRAYHIN BAKERY",
"APNA BAZAAR KENT",
"APNA FROOTICANA",
"AUBURN MAIN SUPER MKT",
"AZ TRADING INC.",
"BETESEB",
"BHARAT RATAN LLC",
"BOMBAY - FIJI BAZAAR",
"BOULEVARD MARKET INC",
"C&K MANAGMENT LLC",
"CACHE GROUP LLC",
"CANAM PIZZA",
"CARDAMOM INDIAN CUISINE",
"CHASHNI SWEETS",
"CLOVE INDIAN CUISINE",
"CORIANDER INDIAN CURRY HOUSE",
"CROWN PACIFIC FINE FOODS INC.",
"DK MARKET",
"DUKEM MARKET SEATAC",
"ELA HABESHA STORE",
"FALAFELVILLE",
"FINEST HALAL CORP",
"FISH & CHICKEN HOUSE",
"GOLDEN INDIAN CURRY HOUSE",
"GURUDWARA SAHIB RENTON",
"HILAAC HALAL MARKET",
"INDIA BAZAAR/SINGH PEX",
"INDIA FOOD MART BLACK DIAMOND",
"INDIA GARDEN",
"INDIA SUPER MKT WAREHOUSE",
"INDIA VILLAGE NEW",
"INDIAN BISTRO KENT",
"INDIAN CURRY PALACE",
"INDIAN FUSION LLC",
"JANOON RESTAURANT",
"JANPATH CATERS",
"JOT INDIAN SWEETS RESTAURANT",
"K.K.MARKET",
"KANISHKA PACIFIC HWY",
"KARMA INDIAN CUISINE",
"KAURS KITCHEN",
"KHALIJ MARKET INC",
"LITTLE INDIA EXPRESS",
"MADINA HALAL MARKET",
"MAHARAJA KENT",
"MAJOR PETROLEUM & GROCERY STORE",
"MANRAJ PALACE",
"MARLAINAS MEDITERRAN KITCHEN",
"MASTI INDIAN CUISINE RENTON",
"MAZAR CUISINE",
"NAAN N CURRY",
"NAMASTE MART BLACK DIAMOND",
"NIAMATULLAH",
"NOOR RAHMAN INTERNATIONAL HALAL MARKET",
"PABLA CUSINE",
"PACIFIC FOODS IMPORTER",
"PACIFIC HALAL MARKET LLC",
"PACIFIC MARKET AND HALAL MEAT",
"PUBLIC HALAL MARKET",
"PUNJABI BAZAR",
"PUNJABI HUT LLC/SPICE WORLD",
"QUEEN SAFA MARKET",
"RAVI VIDEO",
"RICE & CURRY",
"SHAH DELI MART",
"SHANASHEEL LLC",
"SIDHU'S FRUIT STAND",
"SK INDIAN GROCERIES",
"SMALL GROUP LLC",
"SUN STAR TRADERS, INC",
"SUPER SAVER AUBURN",
"SUPER SAVER FOODS (TUKWILA)",
"SUPER SAVER KENT",
"SYSCO SEATTLE, INC.",
"TANDOORI GRILL",
"TANDOORI SLICE",
"TASTY INDIAN CUISINE",
"TAWAKAL",
"TOLO MARKET",
"UNEEK MARKET",
"VAN CHEONG TEA INC",
"VILLAJERADA",
"WATAN BAKERY & HALAL STORE",
"WEST COAST PITA",
"WEST VALLEY SHELL",
"YARAN MARKET",
"H MART LYNNWOOD",
"IMRAN'S MARKET",
"IMRAN'S MARKET -2 (ASHER)",
"J.D.MARKET",
"QFC STORE #856",
"7-ELEVEN #14393",
"7-ELEVEN #18861",
"7-ELEVEN #21833",
"7-ELEVEN #23929",
"7-ELEVEN #34585",
"7-ELEVEN -41108A EVERETT",
"7-ELEVEN EVERETT",
"A1 GAS AND FOOD LLC",
"GROCERY SINGH",
"M&M MART",
"PACIFIC HYPERMARKET",
"SWAGATH MONROE",
"TOWN & COUNTRY MARKETS MILL CREEK",
"DESI BITE HOUSE",
"ENJERA MARKET",
"FEAST ALFORAT MARKET",
"MOMI KITCHEN EVERETTE",
"RED CHILLY EVERETT",
"BAY LEAF BAR & GRILL",
"BISRAT MARKET",
"BUNNA MARKET LLC",
"CURRIES",
"HAPPY BIRD CHILD CARE",
"HELLO INDIA",
"KALIA LYNWOOD (WM)",
"PUNJABI TADKA INDIAN CUISINE & SWEETS",
"SALEM MARKET",
"TAASTY CURRY & PIZZA LLC",
"TASTY CURRY RESTAURANT AND PIZZA",
"APNA BAZAR BOTHELL",
"CLAY PIT CUISINE OF INDIA",
"GOGO MARTS",
"INDIA SUPER MARKET BOTHEL",
"QFC STORE #819",
"QFC STORE #850",
"RAM FOODS BOTHELL",
"7-ELEVEN #19338",
"CHATPATA BY KANISHKA",
"H MART REDMOND",
"QFC STORE #828",
"QFC STORE #820",
"QFC STORE #860",
"QFC STORE #878",
"7-ELEVEN #27304",
"ARTH- THE INDIAN BISTRO",
"BIBI KITCHEN",
"SAAI NAATHA LLC",
"SHOPERIES",
"SWAGATH REDMOND",
"AMAZON BAKERY",
"BIRYANI BOWL",
"CHAAT CORNER",
"KALIA MICROSOFT",
"KUNCHALA'S LLC",
"MICROSOFT CATERING",
"AL-WATAN HALAL MEAT & MARKET LLC",
"BELLEVUE HINDU TEMPL",
"BOMARILLU BIRYANIS",
"BOMBAY GRILL & LOUNGE",
"KANISKA CUSINE OF INDIA",
"LV TEMPLE",
"MASALA MELODY",
"MAYURI BAKERY",
"APNA BAZAR REDMOND",
"KABAB HOUSE KIRKLAND",
"MAYURI FOODS REDMOND",
"MAYURI NEW STORE",
"MAYURI RTC",
"SAAGAR GROCERY",
"SHALIMAR GROCERY",
"THE TURMERIC KITCHEN",

  ];

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/itemlist`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      // Validate and ensure Price is not null or undefined
      const validatedProducts = data.map((product) => ({
        ...product,
        Price: product.Price ?? 0, // Replace null or undefined Price with 0
      }));
      setProducts(validatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle store search
  const handleStoreSearch = (query) => {
    setStoreSearch(query);
    if (!query) {
      setStoreSuggestions(stores);
    } else {
      const filteredStores = stores.filter((store) =>
        store.toLowerCase().includes(query.toLowerCase())
      );
      setStoreSuggestions(filteredStores);
    }
  };

  // Handle store selection
  const handleStoreSelection = (store) => {
    setStoreName(store);
    setStep('orderPage'); // Proceed to products page
    fetchProducts(); // Fetch products for the selected store
  };

  // Render store selection page
  if (step === 'storeSelection') {
    return (
      <div className="store-selection">
        <h2>Select Your Store</h2>
        <input
          type="text"
          placeholder="Enter store name..."
          value={storeSearch}
          onChange={(e) => handleStoreSearch(e.target.value)}
          className="store-search-box"
        />
        <ul className="store-suggestions">
          {storeSuggestions.map((store, index) => (
            <li key={index} onClick={() => handleStoreSelection(store)}>
              {store}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Handle Add to Cart button click
  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setPopupVisible(true);
  };

  // Render products page
  return (
    <div>
      <OrderInstantlyHeader storeName={storeName} />
      <div className="main-content">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="search-bar"
        />
        <select
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="brand-filter"
          value={selectedBrand}
        >
          <option value="">Filter by Brand</option>
          {products &&
            [...new Set(products.map((product) => product.Brand))].map((brand, index) => (
              <option key={index} value={brand}>
                {brand}
              </option>
            ))}
        </select>
        <div className="products-container">
          {products &&
            products
              .filter(
                (product) =>
                  product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (selectedBrand ? product.Brand === selectedBrand : true)
              )
              .map((product, index) => (
                <div key={index} className="product-card">
                  <img src={`${API_BASE_URL}/${product.img}`} alt={product.ProductName} />
                  <h3>{product.ProductName}</h3>
                  <p>Brand: {product.Brand}</p>
                  <p>Price: ${product.Price.toFixed(2)}</p>
                  <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                </div>
              ))}
        </div>
      </div>
      {popupVisible && (
        <ProductOrderPopup
          product={selectedProduct}
          storeName={storeName} // Pass the selected store name as AddedBy
          onClose={() => setPopupVisible(false)}
        />
      )}
    </div>
  );
};

export default OrderInstantly;
