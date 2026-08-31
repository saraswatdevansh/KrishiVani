import json

data = {
  "rice": {
    "display_name": "Paddy / Rice (धान)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 135,
    "sowing_months": [6, 7],
    "harvest_months": [10, 11],
    "suitable_regions": ["Punjab", "Haryana", "Uttar Pradesh", "West Bengal", "Bihar", "Andhra Pradesh", "Tamil Nadu", "Odisha", "Assam"],
    "stages": [
      {
        "name": "Nursery / Germination",
        "duration_days": 25,
        "description": "Seeds are sown in nursery beds. Seedlings develop to 15-20cm height.",
        "care_tips": ["Maintain 2-3cm standing water in nursery", "Apply 2-3 kg Urea per 100 sqm nursery area", "Watch for brown plant hopper in nursery"],
        "irrigation": "Keep nursery continuously moist",
        "fertilizer": "Basal NPK 12:32:16 at sowing",
        "pest_disease": "Brown plant hopper, Blast"
      },
      {
        "name": "Transplanting & Tillering",
        "duration_days": 35,
        "description": "Seedlings transplanted to main field. Rapid vegetative growth and tillering.",
        "care_tips": ["Maintain 3-5cm water level", "Apply first top dressing of nitrogen", "Keep field weed-free"],
        "irrigation": "Maintain 3-5cm standing water",
        "fertilizer": "Top dressing of Urea",
        "pest_disease": "Stem borer, Leaf folder"
      },
      {
        "name": "Panicle Initiation",
        "duration_days": 25,
        "description": "Panicle starts developing inside the stem.",
        "care_tips": ["Apply second top dressing", "Ensure adequate moisture, do not let field dry", "Scout for pests"],
        "irrigation": "Continuous standing water is crucial",
        "fertilizer": "Second top dressing of Urea and Potash",
        "pest_disease": "Sheath blight, Neck blast"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Panicles emerge and anthesis occurs.",
        "care_tips": ["Do not spray chemicals during peak flowering (morning)", "Maintain adequate water"],
        "irrigation": "Maintain 5cm standing water",
        "fertilizer": "Foliar spray if nutrient deficiency seen",
        "pest_disease": "Gundhi bug"
      },
      {
        "name": "Grain Filling",
        "duration_days": 20,
        "description": "Grains develop from milky to dough stage.",
        "care_tips": ["Drain water 15 days after flowering", "Protect from birds"],
        "irrigation": "Intermittent wetting and drying",
        "fertilizer": "None",
        "pest_disease": "False smut, Gundhi bug"
      },
      {
        "name": "Maturity & Harvest",
        "duration_days": 15,
        "description": "Grains turn yellow and hard.",
        "care_tips": ["Drain field completely 10 days before harvest", "Harvest when 80% grains are yellow"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Rodents"
      }
    ]
  },
  "maize": {
    "display_name": "Maize (मक्का)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 120,
    "sowing_months": [6, 7],
    "harvest_months": [9, 10],
    "suitable_regions": ["Karnataka", "Madhya Pradesh", "Bihar", "Maharashtra", "Telangana", "Andhra Pradesh", "Uttar Pradesh"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 10,
        "description": "Seed absorbs water and sprouts.",
        "care_tips": ["Ensure good soil moisture", "Protect from birds", "Pre-emergence herbicide application"],
        "irrigation": "Light irrigation if soil is dry",
        "fertilizer": "Basal dose of NPK (e.g., 12:32:16) + Zinc",
        "pest_disease": "Cutworms, Termites"
      },
      {
        "name": "Vegetative",
        "duration_days": 35,
        "description": "Rapid growth of leaves and stalk.",
        "care_tips": ["First weeding and earthing up", "Apply first N top dressing at knee-high stage", "Scout for FAW"],
        "irrigation": "Irrigate based on soil moisture",
        "fertilizer": "1st top dressing of Urea at knee-high stage",
        "pest_disease": "Fall Armyworm (FAW), Stem Borer"
      },
      {
        "name": "Tasseling & Silking",
        "duration_days": 15,
        "description": "Emergence of male (tassel) and female (silk) flowers.",
        "care_tips": ["Most critical stage for moisture", "Apply second N top dressing before tasseling", "Ensure no water stress"],
        "irrigation": "Crucial irrigation required; avoid stress",
        "fertilizer": "2nd top dressing of Urea before tasseling",
        "pest_disease": "Aphids, Corn earworm"
      },
      {
        "name": "Grain Fill",
        "duration_days": 40,
        "description": "Kernels develop and accumulate starch.",
        "care_tips": ["Maintain soil moisture", "Watch for foliar diseases", "Protect from wild animals"],
        "irrigation": "Maintain adequate moisture during grain filling",
        "fertilizer": "None",
        "pest_disease": "Leaf blight, Rust"
      },
      {
        "name": "Maturity",
        "duration_days": 20,
        "description": "Kernels dry down and black layer forms.",
        "care_tips": ["Stop irrigation", "Harvest when moisture is around 20-25%", "Store properly after drying"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Storage pests if delayed harvest"
      }
    ]
  },
  "chickpea": {
    "display_name": "Chickpea / Gram (चना)",
    "type": "field_crop",
    "season": "rabi",
    "total_duration_days": 110,
    "sowing_months": [10, 11],
    "harvest_months": [2, 3],
    "suitable_regions": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh", "Karnataka"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 10,
        "description": "Seed sprouting and emergence.",
        "care_tips": ["Ensure adequate soil moisture for germination", "Treat seeds with Rhizobium", "Deep sowing if moisture is low"],
        "irrigation": "Pre-sowing irrigation if dry",
        "fertilizer": "Basal application of Phosphorus and minimal Nitrogen",
        "pest_disease": "Termites, Cutworms"
      },
      {
        "name": "Vegetative",
        "duration_days": 30,
        "description": "Branching and vegetative growth.",
        "care_tips": ["Nipping/topping at 35-40 days to encourage branching", "Weed control", "Maintain soil aeration"],
        "irrigation": "No irrigation for first 30 days usually",
        "fertilizer": "None",
        "pest_disease": "Collar rot, Root rot"
      },
      {
        "name": "Flowering",
        "duration_days": 20,
        "description": "Flower initiation and blooming.",
        "care_tips": ["Critical stage for irrigation", "Watch for pod borer moth activity", "Avoid waterlogging"],
        "irrigation": "Light irrigation at pre-flowering",
        "fertilizer": "Foliar spray of 2% Urea if growth is poor",
        "pest_disease": "Gram pod borer (Helicoverpa armigera), Ascochyta blight"
      },
      {
        "name": "Pod Formation",
        "duration_days": 25,
        "description": "Pods develop and grains start filling.",
        "care_tips": ["Install pheromone traps", "Spray insecticide if pod borer crosses ETL", "Maintain moisture"],
        "irrigation": "Light irrigation at pod development",
        "fertilizer": "None",
        "pest_disease": "Gram pod borer"
      },
      {
        "name": "Maturity",
        "duration_days": 25,
        "description": "Leaves turn yellow, pods dry.",
        "care_tips": ["Stop irrigation", "Harvest when leaves fall and pods are dry", "Thresh carefully"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Bruchids (in storage)"
      }
    ]
  },
  "kidneybeans": {
    "display_name": "Kidney Beans / Rajma (राजमा)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 95,
    "sowing_months": [6, 7],
    "harvest_months": [9, 10],
    "suitable_regions": ["Maharashtra", "Himachal Pradesh", "Uttarakhand", "Jammu & Kashmir"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 10,
        "description": "Seed sprouting and emergence.",
        "care_tips": ["Ensure adequate soil moisture", "Treat seeds with fungicides", "Maintain proper depth"],
        "irrigation": "Light irrigation if soil is dry",
        "fertilizer": "Basal NPK dose",
        "pest_disease": "Seed rot, Cutworms"
      },
      {
        "name": "Vegetative",
        "duration_days": 25,
        "description": "Branching and vegetative growth.",
        "care_tips": ["First weeding", "Apply N top dressing", "Monitor for foliage pests"],
        "irrigation": "Irrigate at 10-15 day intervals",
        "fertilizer": "Top dressing of Nitrogen at 25-30 days",
        "pest_disease": "Aphids, Whitefly"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Flower blooming.",
        "care_tips": ["Critical stage for moisture", "Avoid waterlogging", "Watch for blossom thrips"],
        "irrigation": "Crucial irrigation required",
        "fertilizer": "Foliar nutrient spray if needed",
        "pest_disease": "Thrips, Anthracnose"
      },
      {
        "name": "Pod Development",
        "duration_days": 25,
        "description": "Pods form and seeds develop.",
        "care_tips": ["Maintain moisture", "Protect from pod borers", "Control weeds"],
        "irrigation": "Irrigate to support grain filling",
        "fertilizer": "None",
        "pest_disease": "Pod borer"
      },
      {
        "name": "Maturity",
        "duration_days": 20,
        "description": "Pods mature and dry.",
        "care_tips": ["Stop irrigation", "Harvest when pods are brown and dry", "Sun dry after harvest"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Storage pests"
      }
    ]
  },
  "pigeonpeas": {
    "display_name": "Pigeonpeas / Arhar (अरहर)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 175,
    "sowing_months": [6, 7],
    "harvest_months": [12, 1],
    "suitable_regions": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Uttar Pradesh", "Gujarat"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 15,
        "description": "Seed emergence.",
        "care_tips": ["Seed treatment with Rhizobium", "Pre-emergence herbicide", "Ensure good drainage"],
        "irrigation": "Usually rainfed; life-saving irrigation if needed",
        "fertilizer": "Basal P and S application",
        "pest_disease": "Wilt, Root rot"
      },
      {
        "name": "Vegetative",
        "duration_days": 60,
        "description": "Slow initial growth followed by rapid branching.",
        "care_tips": ["Interculture operations to control weeds", "Provide good drainage", "Scout for leaf webber"],
        "irrigation": "Avoid waterlogging; drain excess rainwater",
        "fertilizer": "None",
        "pest_disease": "Leaf webber, Phytophthora blight"
      },
      {
        "name": "Flowering",
        "duration_days": 30,
        "description": "Prolonged flowering phase.",
        "care_tips": ["Critical stage for moisture", "Install pheromone traps for pod borer", "Spray for pod fly if needed"],
        "irrigation": "Irrigation if dry spell occurs",
        "fertilizer": "Foliar spray of KNO3 if moisture stress",
        "pest_disease": "Pod borer (Helicoverpa), Pod fly, Wilt"
      },
      {
        "name": "Pod Formation",
        "duration_days": 40,
        "description": "Pods fill and develop.",
        "care_tips": ["Monitor pod borer damage", "Apply insecticides if threshold reached", "Protect from birds"],
        "irrigation": "Irrigation if dry spell occurs",
        "fertilizer": "None",
        "pest_disease": "Pod bug, Pod borer"
      },
      {
        "name": "Maturity",
        "duration_days": 30,
        "description": "Pods mature and turn brown.",
        "care_tips": ["Harvest when 80% pods turn brown", "Sun dry harvested crop", "Threshing"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Bruchids (storage)"
      }
    ]
  },
  "mothbeans": {
    "display_name": "Moth Beans (मोठ)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 80,
    "sowing_months": [7],
    "harvest_months": [9, 10],
    "suitable_regions": ["Rajasthan", "Gujarat", "Haryana", "Punjab"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 8,
        "description": "Seed sprouting.",
        "care_tips": ["Sow with onset of monsoon", "Maintain proper spacing", "Seed treatment"],
        "irrigation": "Rainfed",
        "fertilizer": "Minimal basal P",
        "pest_disease": "White grub"
      },
      {
        "name": "Vegetative",
        "duration_days": 25,
        "description": "Creeping growth habit covers soil.",
        "care_tips": ["One hand weeding before 25 days", "Drought tolerant, wait for rain", "Monitor for yellow mosaic"],
        "irrigation": "Rainfed",
        "fertilizer": "None",
        "pest_disease": "Whitefly (vector for YMV)"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Small yellow flowers appear.",
        "care_tips": ["Protect from grazing", "Monitor for pests", "Life-saving irrigation if prolonged dry spell"],
        "irrigation": "Life-saving if severe drought",
        "fertilizer": "None",
        "pest_disease": "Aphids, Jassids"
      },
      {
        "name": "Pod Development",
        "duration_days": 20,
        "description": "Pods form and mature quickly.",
        "care_tips": ["Monitor pod borers", "Prevent moisture stress if possible", "Weed free field"],
        "irrigation": "Rainfed",
        "fertilizer": "None",
        "pest_disease": "Pod borer"
      },
      {
        "name": "Maturity",
        "duration_days": 12,
        "description": "Pods mature.",
        "care_tips": ["Harvest promptly to avoid shattering", "Uproot whole plant", "Dry in sun"],
        "irrigation": "None",
        "fertilizer": "None",
        "pest_disease": "Storage pests"
      }
    ]
  },
  "mungbean": {
    "display_name": "Mung Bean / Green Gram (मूंग)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 65,
    "sowing_months": [6, 7],
    "harvest_months": [8, 9],
    "suitable_regions": ["Rajasthan", "Maharashtra", "Andhra Pradesh", "Madhya Pradesh", "Odisha", "Bihar"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 7,
        "description": "Seed sprouting.",
        "care_tips": ["Seed treatment with Rhizobium", "Ensure good moisture", "Pre-emergence herbicide"],
        "irrigation": "Pre-sowing irrigation or sow after rain",
        "fertilizer": "Basal N and P",
        "pest_disease": "Flea beetle"
      },
      {
        "name": "Vegetative",
        "duration_days": 20,
        "description": "Rapid growth and branching.",
        "care_tips": ["First weeding at 15-20 days", "Watch for whitefly", "Maintain soil aeration"],
        "irrigation": "Irrigate if dry spell",
        "fertilizer": "None",
        "pest_disease": "Whitefly (YMV vector), Thrips"
      },
      {
        "name": "Flowering",
        "duration_days": 12,
        "description": "Flower blooming.",
        "care_tips": ["Critical stage for irrigation", "Spray for whitefly control", "Foliar nutrient spray"],
        "irrigation": "Critical irrigation needed if dry",
        "fertilizer": "2% Urea or DAP foliar spray",
        "pest_disease": "Yellow Mosaic Virus (YMV), Pod borer"
      },
      {
        "name": "Pod Development",
        "duration_days": 18,
        "description": "Pods form and seeds develop.",
        "care_tips": ["Monitor for pod borer", "Maintain moisture", "Avoid waterlogging"],
        "irrigation": "Irrigate for grain filling",
        "fertilizer": "None",
        "pest_disease": "Pod borer, Powdery mildew"
      },
      {
        "name": "Maturity",
        "duration_days": 10,
        "description": "Pods turn black/brown.",
        "care_tips": ["Harvest when 80% pods are mature", "Multiple pickings may be needed", "Dry thoroughly"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Bruchids"
      }
    ]
  },
  "blackgram": {
    "display_name": "Black Gram / Urad (उड़द)",
    "type": "field_crop",
    "season": "kharif",
    "total_duration_days": 80,
    "sowing_months": [6, 7],
    "harvest_months": [9, 10],
    "suitable_regions": ["Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh", "Maharashtra", "Tamil Nadu"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 8,
        "description": "Seed sprouting.",
        "care_tips": ["Rhizobium treatment", "Sow in lines", "Maintain good drainage"],
        "irrigation": "Sow after rain",
        "fertilizer": "Basal dose of N and P",
        "pest_disease": "Stem fly"
      },
      {
        "name": "Vegetative",
        "duration_days": 25,
        "description": "Canopy development.",
        "care_tips": ["Weed control at 20-25 days", "Monitor for yellow mosaic", "Ensure drainage"],
        "irrigation": "Drain excess water",
        "fertilizer": "None",
        "pest_disease": "Whitefly (YMV vector), Jassids"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Flower initiation.",
        "care_tips": ["Critical for moisture", "Control whitefly to prevent YMV", "Foliar nutrition if weak"],
        "irrigation": "Irrigate if prolonged dry spell",
        "fertilizer": "Foliar spray if needed",
        "pest_disease": "Yellow Mosaic Virus, Cercospora leaf spot"
      },
      {
        "name": "Pod Development",
        "duration_days": 20,
        "description": "Pods form and fill.",
        "care_tips": ["Monitor for pod borers", "Maintain moisture", "Protect from grazing"],
        "irrigation": "Irrigate if required",
        "fertilizer": "None",
        "pest_disease": "Pod borer, Maruca"
      },
      {
        "name": "Maturity",
        "duration_days": 12,
        "description": "Pods turn black.",
        "care_tips": ["Harvest when pods are fully black", "Dry completely before threshing", "Store properly"],
        "irrigation": "Stop",
        "fertilizer": "None",
        "pest_disease": "Storage pests"
      }
    ]
  },
  "lentil": {
    "display_name": "Lentil / Masoor (मसूर)",
    "type": "field_crop",
    "season": "rabi",
    "total_duration_days": 105,
    "sowing_months": [10, 11],
    "harvest_months": [2, 3],
    "suitable_regions": ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "West Bengal", "Rajasthan"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 10,
        "description": "Seed sprouting.",
        "care_tips": ["Seed treatment with fungicides", "Sow in adequate moisture", "Rhizobium inoculation"],
        "irrigation": "Pre-sowing irrigation",
        "fertilizer": "Basal application of P and low N",
        "pest_disease": "Collar rot, Wilt"
      },
      {
        "name": "Vegetative",
        "duration_days": 30,
        "description": "Branching and growth.",
        "care_tips": ["First weeding at 30 days", "Monitor for aphids", "Maintain aeration"],
        "irrigation": "Usually no irrigation needed early",
        "fertilizer": "None",
        "pest_disease": "Aphids"
      },
      {
        "name": "Flowering",
        "duration_days": 20,
        "description": "Flower blooming.",
        "care_tips": ["Critical for irrigation", "Watch for pod borer", "Avoid moisture stress"],
        "irrigation": "First irrigation at pre-flowering",
        "fertilizer": "None",
        "pest_disease": "Pod borer, Rust"
      },
      {
        "name": "Pod Formation",
        "duration_days": 25,
        "description": "Pods develop and fill.",
        "care_tips": ["Irrigate at pod filling", "Monitor pests", "Control weeds"],
        "irrigation": "Second irrigation at pod filling",
        "fertilizer": "None",
        "pest_disease": "Pod borer"
      },
      {
        "name": "Maturity",
        "duration_days": 20,
        "description": "Plants turn yellow, pods dry.",
        "care_tips": ["Harvest when plants turn yellow to brown", "Avoid delayed harvest to prevent shattering", "Thresh when dry"],
        "irrigation": "Stop",
        "fertilizer": "None",
        "pest_disease": "Bruchids"
      }
    ]
  },
  "pomegranate": {
    "display_name": "Pomegranate (अनार)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 190,
    "sowing_months": [6, 7],
    "harvest_months": [12, 1],
    "suitable_regions": ["Maharashtra", "Karnataka", "Gujarat", "Andhra Pradesh", "Rajasthan"],
    "stages": [
      {
        "name": "Rest (Bahar Treatment)",
        "duration_days": 30,
        "description": "Withholding water to induce rest.",
        "care_tips": ["Withhold water for 3-4 weeks", "Prune dried/diseased twigs", "Apply FYM and basal fertilizers at end of rest"],
        "irrigation": "Stop irrigation completely",
        "fertilizer": "Apply organic manure and basal NPK at end of rest",
        "pest_disease": "Stem borer"
      },
      {
        "name": "New Flush",
        "duration_days": 25,
        "description": "Emergence of new leaves after irrigation resumes.",
        "care_tips": ["Resume irrigation gradually", "Monitor for thrips and aphids", "Apply first N split"],
        "irrigation": "Light irrigation, gradually increasing",
        "fertilizer": "First split of Nitrogen",
        "pest_disease": "Thrips, Aphids, Bacterial blight"
      },
      {
        "name": "Flowering",
        "duration_days": 30,
        "description": "Blossom emergence and blooming.",
        "care_tips": ["Ensure adequate moisture", "Avoid heavy pesticide sprays", "Foliar spray of micronutrients"],
        "irrigation": "Regular drip irrigation",
        "fertilizer": "Micronutrient spray (Zn, B, Fe)",
        "pest_disease": "Flower thrips, Blight"
      },
      {
        "name": "Fruit Set",
        "duration_days": 25,
        "description": "Small fruits form.",
        "care_tips": ["Apply second N split", "Thin out excess fruits if heavy set", "Monitor for fruit borer"],
        "irrigation": "Maintain optimal moisture",
        "fertilizer": "Second split of Nitrogen and Potash",
        "pest_disease": "Fruit borer, T-mosquito bug"
      },
      {
        "name": "Fruit Development",
        "duration_days": 60,
        "description": "Fruits enlarge and arils develop.",
        "care_tips": ["Bag fruits for better color and protection", "Maintain uniform irrigation to avoid cracking", "Apply Potash"],
        "irrigation": "Regular and uniform irrigation crucial",
        "fertilizer": "Foliar application of K2SO4",
        "pest_disease": "Fruit cracking, Fruit spot"
      },
      {
        "name": "Harvest",
        "duration_days": 20,
        "description": "Fruits mature, rind color develops.",
        "care_tips": ["Harvest when rind turns yellowish-red", "Cut with clippers, do not pull", "Grade according to size"],
        "irrigation": "Reduce irrigation slightly",
        "fertilizer": "None",
        "pest_disease": "Fruit fly"
      }
    ]
  },
  "banana": {
    "display_name": "Banana (केला)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 315,
    "sowing_months": [6, 7],
    "harvest_months": [4, 5, 6],
    "suitable_regions": ["Tamil Nadu", "Maharashtra", "Gujarat", "Andhra Pradesh", "Karnataka", "Bihar"],
    "stages": [
      {
        "name": "Planting & Establishment",
        "duration_days": 60,
        "description": "Suckers or tissue culture plants establish roots.",
        "care_tips": ["Plant in well-drained pits", "Provide partial shade if very hot", "Regular light watering"],
        "irrigation": "Frequent light irrigation",
        "fertilizer": "Apply FYM, Neem cake, and basal NPK",
        "pest_disease": "Rhizome weevil, Nematodes"
      },
      {
        "name": "Vegetative Growth",
        "duration_days": 120,
        "description": "Rapid leaf and pseudostem development.",
        "care_tips": ["Apply fertilizers in splits every 30 days", "Desuckering (remove unwanted suckers)", "Provide physical support (propping) if windy"],
        "irrigation": "Regular irrigation to maintain high moisture",
        "fertilizer": "Split applications of N and K every month",
        "pest_disease": "Sigatoka leaf spot, Aphids (BBTV vector)"
      },
      {
        "name": "Flowering / Bunch Emergence",
        "duration_days": 30,
        "description": "Inflorescence emerges from the pseudostem.",
        "care_tips": ["Ensure high soil moisture", "Remove male bud after fruit set (denavelling)", "Tie bunches to prop"],
        "irrigation": "Crucial stage for water",
        "fertilizer": "Final split of Potash",
        "pest_disease": "Thrips, Scarring beetle"
      },
      {
        "name": "Fruit Development",
        "duration_days": 90,
        "description": "Fingers develop and fill.",
        "care_tips": ["Cover bunches with perforated bags", "Spray bunch with SOP", "Maintain moisture"],
        "irrigation": "Regular irrigation",
        "fertilizer": "Foliar spray of Sulphate of Potash (SOP)",
        "pest_disease": "Fruit scarring beetle"
      },
      {
        "name": "Harvest",
        "duration_days": 15,
        "description": "Fingers reach maturity.",
        "care_tips": ["Harvest when fingers are plump and angles are rounded", "Harvest carefully to avoid bruising", "Leave one follower sucker for next ratoon"],
        "irrigation": "Stop irrigation a few days before harvest",
        "fertilizer": "None",
        "pest_disease": "Post-harvest rot"
      }
    ]
  },
  "mango": {
    "display_name": "Mango (आम)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 255,
    "sowing_months": [6, 7],
    "harvest_months": [5, 6],
    "suitable_regions": ["Uttar Pradesh", "Andhra Pradesh", "Telangana", "Karnataka", "Bihar", "Gujarat", "Maharashtra"],
    "stages": [
      {
        "name": "Dormancy / Rest",
        "duration_days": 60,
        "description": "Post-harvest rest period.",
        "care_tips": ["Prune dead, diseased, and criss-cross branches", "Apply paclobutrazol (if practicing) for induction", "Withhold irrigation"],
        "irrigation": "No irrigation",
        "fertilizer": "Apply FYM and basal NPK post-harvest",
        "pest_disease": "Stem borer, Mango hoppers (on trunk)"
      },
      {
        "name": "New Flush",
        "duration_days": 30,
        "description": "Emergence of vegetative flush.",
        "care_tips": ["Monitor for leaf-eating caterpillars", "Foliar nutrition if required", "Maintain field hygiene"],
        "irrigation": "Light irrigation if very dry",
        "fertilizer": "None",
        "pest_disease": "Leaf webber, Shoot borer"
      },
      {
        "name": "Flowering",
        "duration_days": 30,
        "description": "Panicle emergence and blooming.",
        "care_tips": ["Do not irrigate heavily to avoid flower drop", "Spray for hopper and powdery mildew management", "Encourage pollinators"],
        "irrigation": "Light or no irrigation",
        "fertilizer": "Foliar spray of Urea/KNO3 if delayed",
        "pest_disease": "Mango hopper, Powdery mildew, Mealybug"
      },
      {
        "name": "Fruit Set",
        "duration_days": 30,
        "description": "Pea and marble stage of fruits.",
        "care_tips": ["Start regular irrigation", "Apply first foliar spray of NAA to prevent fruit drop", "Monitor for pests"],
        "irrigation": "Start regular irrigation every 10-15 days",
        "fertilizer": "None",
        "pest_disease": "Fruit borer, Anthracnose"
      },
      {
        "name": "Fruit Development",
        "duration_days": 75,
        "description": "Fruits enlarge to mature size.",
        "care_tips": ["Regular irrigation is crucial", "Bagging of fruits for export quality", "Monitor for fruit fly"],
        "irrigation": "Regular irrigation",
        "fertilizer": "Foliar K to improve fruit quality",
        "pest_disease": "Fruit fly, Bacterial canker"
      },
      {
        "name": "Harvest",
        "duration_days": 30,
        "description": "Fruits reach maturity.",
        "care_tips": ["Stop irrigation 15 days before harvest", "Harvest with 1-2 cm stalk attached using harvester", "Desap fruits immediately"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Fruit fly, Anthracnose (post-harvest)"
      }
    ]
  },
  "grapes": {
    "display_name": "Grapes (अंगूर)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 155,
    "sowing_months": [1, 10],
    "harvest_months": [3, 4],
    "suitable_regions": ["Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
    "stages": [
      {
        "name": "Pruning & Dormancy",
        "duration_days": 30,
        "description": "Forward pruning (October) for fruiting.",
        "care_tips": ["Apply hydrogen cyanamide to break dormancy", "Apply basal fertilizers in trenches", "Clean cultivation"],
        "irrigation": "Light irrigation after pruning",
        "fertilizer": "Basal application of NPK and organic matter",
        "pest_disease": "Flea beetle, Mealybug"
      },
      {
        "name": "Bud Break & Shoot Growth",
        "duration_days": 20,
        "description": "Buds sprout and shoots elongate.",
        "care_tips": ["Shoot thinning (retain required shoots)", "Monitor for downy mildew if cloudy", "Apply N fertilizers"],
        "irrigation": "Regular drip irrigation",
        "fertilizer": "Nitrogen through fertigation",
        "pest_disease": "Thrips, Downy mildew"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Inflorescence develops and blooms.",
        "care_tips": ["Avoid heavy irrigation", "Gibberellic Acid (GA3) dip for elongation", "Monitor for powdery mildew"],
        "irrigation": "Reduced irrigation to prevent flower drop",
        "fertilizer": "Stop N, focus on P and micronutrients",
        "pest_disease": "Powdery mildew, Thrips"
      },
      {
        "name": "Berry Development",
        "duration_days": 45,
        "description": "Berries grow from shatter to pea size.",
        "care_tips": ["GA3 dips for berry sizing", "Berry thinning to reduce compactness", "Apply Potassium"],
        "irrigation": "Increase irrigation for cell enlargement",
        "fertilizer": "Potassium through fertigation",
        "pest_disease": "Mealybug, Powdery mildew"
      },
      {
        "name": "Veraison & Ripening",
        "duration_days": 30,
        "description": "Berries change color, soften and accumulate sugar.",
        "care_tips": ["Remove basal leaves for aeration and color", "Monitor brix (TSS)", "Protect from birds"],
        "irrigation": "Reduce irrigation slightly to improve sugar",
        "fertilizer": "High Potassium fertigation",
        "pest_disease": "Botrytis bunch rot"
      },
      {
        "name": "Harvest",
        "duration_days": 15,
        "description": "Berries attain optimal TSS.",
        "care_tips": ["Harvest during cool hours", "Handle bunches carefully to preserve bloom", "Pack promptly"],
        "irrigation": "Stop irrigation a few days before",
        "fertilizer": "None",
        "pest_disease": "Post-harvest decay"
      }
    ]
  },
  "watermelon": {
    "display_name": "Watermelon (तरबूज)",
    "type": "fruit",
    "season": "zaid",
    "total_duration_days": 90,
    "sowing_months": [2, 3],
    "harvest_months": [5, 6],
    "suitable_regions": ["Uttar Pradesh", "Karnataka", "Andhra Pradesh", "Odisha", "West Bengal", "Rajasthan"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 7,
        "description": "Seed sprouting in warm soil.",
        "care_tips": ["Sow on raised beds or use mulch", "Ensure soil temp is optimal", "Protect early seedlings from cold"],
        "irrigation": "Light irrigation for germination",
        "fertilizer": "Basal NPK in rows",
        "pest_disease": "Cutworms, Seed rot"
      },
      {
        "name": "Vine Growth",
        "duration_days": 25,
        "description": "Rapid vegetative growth and spreading.",
        "care_tips": ["Weed control before vines cover ground", "Apply N top dressing", "Train vines on beds"],
        "irrigation": "Regular irrigation every 7-10 days",
        "fertilizer": "Top dressing of N",
        "pest_disease": "Leaf miner, Aphids, Red pumpkin beetle"
      },
      {
        "name": "Flowering",
        "duration_days": 15,
        "description": "Male and female flowers open.",
        "care_tips": ["Ensure presence of bees for pollination", "Do not spray toxic pesticides during day", "Maintain moisture"],
        "irrigation": "Consistent moisture is critical",
        "fertilizer": "Foliar micronutrients (B, Zn)",
        "pest_disease": "Thrips, Powdery mildew"
      },
      {
        "name": "Fruit Development",
        "duration_days": 30,
        "description": "Fruits enlarge rapidly.",
        "care_tips": ["Place dry grass under fruit to prevent rot", "Avoid moisture fluctuations to prevent cracking", "Apply K"],
        "irrigation": "Regular deep irrigation",
        "fertilizer": "Apply Potassium for fruit size/sweetness",
        "pest_disease": "Fruit fly, Anthracnose"
      },
      {
        "name": "Maturity & Harvest",
        "duration_days": 13,
        "description": "Fruits ripen, sugars accumulate.",
        "care_tips": ["Stop irrigation 3-5 days before harvest", "Check for dull thump sound and yellow ground spot", "Harvest with a portion of vine"],
        "irrigation": "Stop irrigation to increase sweetness",
        "fertilizer": "None",
        "pest_disease": "Fruit rot"
      }
    ]
  },
  "muskmelon": {
    "display_name": "Muskmelon (खरबूजा)",
    "type": "fruit",
    "season": "zaid",
    "total_duration_days": 75,
    "sowing_months": [2, 3],
    "harvest_months": [5, 6],
    "suitable_regions": ["Uttar Pradesh", "Punjab", "Haryana", "Rajasthan", "Madhya Pradesh"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 7,
        "description": "Seed sprouting.",
        "care_tips": ["Sow on beds with plastic mulch", "Treat seeds", "Ensure warm soil"],
        "irrigation": "Light irrigation",
        "fertilizer": "Basal NPK",
        "pest_disease": "Red pumpkin beetle, Damping off"
      },
      {
        "name": "Vine Growth",
        "duration_days": 20,
        "description": "Vine elongation and branching.",
        "care_tips": ["Weed management", "Apply N top dressing", "Pinch main shoot to encourage lateral branches (if practiced)"],
        "irrigation": "Regular irrigation",
        "fertilizer": "Nitrogen top dressing",
        "pest_disease": "Aphids, Leaf miners"
      },
      {
        "name": "Flowering",
        "duration_days": 12,
        "description": "Flower blooming and pollination.",
        "care_tips": ["Ensure bee activity", "Maintain consistent moisture", "Avoid pesticide spray at bloom"],
        "irrigation": "Adequate moisture for fruit set",
        "fertilizer": "Foliar boron",
        "pest_disease": "Powdery mildew, Downy mildew"
      },
      {
        "name": "Fruit Development",
        "duration_days": 25,
        "description": "Fruits enlarge and net forms on skin.",
        "care_tips": ["Apply K fertilizer", "Protect fruits from direct soil contact", "Monitor for fruit fly"],
        "irrigation": "Regular irrigation, avoid waterlogging",
        "fertilizer": "Potassium application",
        "pest_disease": "Fruit fly, Fusarium wilt"
      },
      {
        "name": "Maturity & Harvest",
        "duration_days": 11,
        "description": "Fruits ripen and develop aroma.",
        "care_tips": ["Stop irrigation to improve TSS", "Harvest at 'full slip' stage (stem detaches easily)", "Handle carefully to avoid bruising"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Fruit rot"
      }
    ]
  },
  "apple": {
    "display_name": "Apple (सेब)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 265,
    "sowing_months": [12, 1],
    "harvest_months": [8, 9, 10],
    "suitable_regions": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Arunachal Pradesh"],
    "stages": [
      {
        "name": "Dormancy",
        "duration_days": 90,
        "description": "Winter rest period.",
        "care_tips": ["Pruning of trees", "Application of dormant oil sprays", "Apply basal fertilizers (FYM, P, K)"],
        "irrigation": "Usually snow-covered or rainfed",
        "fertilizer": "Basal organic manure, P, K, and half N",
        "pest_disease": "San Jose Scale, Woolly Apple Aphid (overwintering)"
      },
      {
        "name": "Bud Break & Bloom",
        "duration_days": 25,
        "description": "Silver tip to full bloom.",
        "care_tips": ["Protect from late spring frost", "Place bee hives for pollination", "Spray fungicides for scab before bloom"],
        "irrigation": "Provide irrigation if dry",
        "fertilizer": "Foliar spray of Boron and Zinc",
        "pest_disease": "Apple Scab, Powdery Mildew, Thrips"
      },
      {
        "name": "Fruit Set",
        "duration_days": 20,
        "description": "Petal fall to fruit development.",
        "care_tips": ["Apply remaining half of Nitrogen", "Thin out excess fruits", "Monitor for mites"],
        "irrigation": "Regular irrigation begins",
        "fertilizer": "Remaining Nitrogen",
        "pest_disease": "European Red Mite, Apple Scab"
      },
      {
        "name": "Fruit Development",
        "duration_days": 90,
        "description": "Cell expansion and fruit sizing.",
        "care_tips": ["Maintain consistent soil moisture", "Summer pruning for light penetration", "Calcium sprays to prevent bitter pit"],
        "irrigation": "Crucial stage for regular irrigation",
        "fertilizer": "Foliar Calcium and Potassium",
        "pest_disease": "Codling Moth, Mites, Alternaria"
      },
      {
        "name": "Harvest",
        "duration_days": 30,
        "description": "Color development and maturation.",
        "care_tips": ["Harvest based on TSS and starch iodine test", "Pick carefully to avoid bruising", "Pre-cooling immediately after harvest"],
        "irrigation": "Reduce irrigation slightly before harvest",
        "fertilizer": "None",
        "pest_disease": "Pre-harvest fruit drop, Post-harvest rots"
      }
    ]
  },
  "orange": {
    "display_name": "Orange / Mandarin (संतरा)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 250,
    "sowing_months": [6, 7],
    "harvest_months": [12, 1, 2],
    "suitable_regions": ["Maharashtra (Nagpur)", "Punjab", "Rajasthan", "Madhya Pradesh", "Assam"],
    "stages": [
      {
        "name": "Dormancy (Bahar Treatment)",
        "duration_days": 45,
        "description": "Moisture stress to induce flowering.",
        "care_tips": ["Withhold water for 3-4 weeks", "Prune dry branches", "Apply FYM and basal dose"],
        "irrigation": "Withhold irrigation",
        "fertilizer": "Basal application of NPK and manures",
        "pest_disease": "Citrus psylla, Leaf miner (on old leaves)"
      },
      {
        "name": "Flowering",
        "duration_days": 30,
        "description": "Resumption of watering leads to new flush and flowers.",
        "care_tips": ["Resume light irrigation", "Foliar spray of micronutrients", "Control psylla"],
        "irrigation": "Gradually increase irrigation",
        "fertilizer": "Micronutrient spray (Zn, Fe, Mn)",
        "pest_disease": "Citrus Psylla, Aphids, Blossom blight"
      },
      {
        "name": "Fruit Set",
        "duration_days": 25,
        "description": "Pea sized fruits form.",
        "care_tips": ["Apply second dose of Nitrogen", "Maintain adequate moisture", "Monitor for fruit drop"],
        "irrigation": "Regular irrigation",
        "fertilizer": "Second dose of N",
        "pest_disease": "Citrus canker, Mites"
      },
      {
        "name": "Fruit Development",
        "duration_days": 120,
        "description": "Fruits expand and juice sacs develop.",
        "care_tips": ["Regular irrigation to prevent fruit cracking/drop", "Apply Potassium", "Monitor for fruit sucking moth"],
        "irrigation": "Consistent moisture required",
        "fertilizer": "Potassium application",
        "pest_disease": "Fruit sucking moth, Citrus black core rot"
      },
      {
        "name": "Maturity & Harvest",
        "duration_days": 30,
        "description": "Color break and sugar accumulation.",
        "care_tips": ["Harvest when proper color and TSS/Acid ratio is reached", "Clip fruits, do not pull", "Avoid harvesting when wet"],
        "irrigation": "Reduce irrigation to improve quality",
        "fertilizer": "None",
        "pest_disease": "Fruit fly, Post-harvest decay"
      }
    ]
  },
  "papaya": {
    "display_name": "Papaya (पपीता)",
    "type": "fruit",
    "season": "perennial",
    "total_duration_days": 315,
    "sowing_months": [6, 7, 8],
    "harvest_months": [4, 5, 6, 7],
    "suitable_regions": ["Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra", "Madhya Pradesh", "West Bengal"],
    "stages": [
      {
        "name": "Seedling (Nursery)",
        "duration_days": 45,
        "description": "Seeds grown in polybags/nursery.",
        "care_tips": ["Protect from heavy rain and direct sun", "Drench with fungicide to prevent damping off", "Maintain moist, not wet, soil"],
        "irrigation": "Light daily watering",
        "fertilizer": "Liquid fertilizer if seedlings are weak",
        "pest_disease": "Damping off, Whitefly"
      },
      {
        "name": "Vegetative Growth",
        "duration_days": 90,
        "description": "Transplanting and rapid plant growth.",
        "care_tips": ["Plant on raised beds to ensure drainage", "Apply fertilizer every 2 months", "Weed regularly"],
        "irrigation": "Regular irrigation; HIGHLY sensitive to waterlogging",
        "fertilizer": "Frequent split applications of NPK",
        "pest_disease": "Papaya Ring Spot Virus (PRSV), Mealybug, Root rot"
      },
      {
        "name": "Flowering",
        "duration_days": 30,
        "description": "First flowers appear.",
        "care_tips": ["Remove male plants (keep 10% for pollination if dioecious)", "Apply Boron for good fruit set", "Maintain moisture"],
        "irrigation": "Adequate moisture for fruit set",
        "fertilizer": "Boron foliar spray",
        "pest_disease": "Mites, Aphids (PRSV vectors)"
      },
      {
        "name": "Fruit Development",
        "duration_days": 120,
        "description": "Fruits enlarge on the trunk.",
        "care_tips": ["Apply Potassium for fruit quality", "Thin out crowded fruits", "Propping if plant is heavily loaded"],
        "irrigation": "Regular irrigation",
        "fertilizer": "High K application",
        "pest_disease": "Mealybug, Anthracnose"
      },
      {
        "name": "Harvest",
        "duration_days": 30,
        "description": "Fruits ripen sequentially.",
        "care_tips": ["Harvest when skin shows yellow streaks", "Wrap fruits in paper to avoid latex burns/bruising", "Harvest carefully"],
        "irrigation": "Maintain optimal irrigation",
        "fertilizer": "None",
        "pest_disease": "Anthracnose, Fruit fly"
      }
    ]
  },
  "coconut": {
    "display_name": "Coconut (नारियल)",
    "type": "plantation",
    "season": "perennial",
    "total_duration_days": 1445,
    "sowing_months": [6, 7],
    "harvest_months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "suitable_regions": ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Odisha", "West Bengal", "Maharashtra"],
    "stages": [
      {
        "name": "Seedling",
        "duration_days": 180,
        "description": "Seednuts planted in nursery.",
        "care_tips": ["Select healthy vigorous seedlings", "Plant in deep pits", "Provide shade and protect from cattle"],
        "irrigation": "Regular watering in dry season",
        "fertilizer": "FYM application in pit",
        "pest_disease": "Termites, White grub"
      },
      {
        "name": "Juvenile",
        "duration_days": 900,
        "description": "Pre-bearing vegetative phase (approx 2.5-3 years).",
        "care_tips": ["Apply fertilizers in two splits (May-June & Sept-Oct)", "Keep basin weed-free", "Summer irrigation is critical"],
        "irrigation": "Irrigate every 4-5 days during summer",
        "fertilizer": "Gradually increase NPK doses each year",
        "pest_disease": "Rhinoceros beetle, Red palm weevil"
      },
      {
        "name": "Initial Bearing",
        "duration_days": 365,
        "description": "First flowering and fruiting.",
        "care_tips": ["Apply full recommended dose of fertilizers", "Apply micronutrients like Boron", "Monitor for leaf eating caterpillar"],
        "irrigation": "Drip irrigation or basin irrigation",
        "fertilizer": "Full dose of NPK (e.g., 500:320:1200 g/palm/year)",
        "pest_disease": "Eriophyid mite, Bud rot, Basal stem rot"
      },
      {
        "name": "Full Bearing",
        "duration_days": 365,
        "description": "Continuous flowering and harvesting year-round.",
        "care_tips": ["Harvest mature nuts every 45 days", "Practice green manuring in basins", "Regular pest monitoring"],
        "irrigation": "Regular summer irrigation to prevent button drop",
        "fertilizer": "Apply fertilizers in two splits annually",
        "pest_disease": "Rhinoceros beetle, Red palm weevil, Root wilt"
      }
    ]
  },
  "cotton": {
    "display_name": "Cotton (कपास)",
    "type": "fiber",
    "season": "kharif",
    "total_duration_days": 162,
    "sowing_months": [5, 6, 7],
    "harvest_months": [10, 11, 12, 1],
    "suitable_regions": ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Punjab", "Haryana"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 12,
        "description": "Seed sprouting and emergence.",
        "care_tips": ["Sow Bt cotton seeds at proper spacing", "Pre-emergence herbicide", "Ensure good soil moisture"],
        "irrigation": "Pre-sowing irrigation or sow on rain",
        "fertilizer": "Basal NPK",
        "pest_disease": "Cutworms, Damping off"
      },
      {
        "name": "Vegetative",
        "duration_days": 45,
        "description": "Development of main stem and branches.",
        "care_tips": ["Weed control is critical", "First top dressing of Nitrogen at 30 days", "Monitor sucking pests"],
        "irrigation": "Irrigate if prolonged dry spell",
        "fertilizer": "First split of Nitrogen",
        "pest_disease": "Jassids, Aphids, Thrips, Whitefly"
      },
      {
        "name": "Squaring",
        "duration_days": 25,
        "description": "Formation of flower buds (squares).",
        "care_tips": ["Avoid moisture stress to prevent square drop", "Apply second N dose", "Monitor for Pink Bollworm moths"],
        "irrigation": "Irrigate at square formation if rain fails",
        "fertilizer": "Second split of N, foliar Mg if reddening occurs",
        "pest_disease": "Whitefly, Mealybug, Pink Bollworm (initiation)"
      },
      {
        "name": "Flowering & Boll Formation",
        "duration_days": 45,
        "description": "Blooms appear and develop into bolls.",
        "care_tips": ["Critical stage for irrigation", "Foliar spray of KNO3 for better boll development", "Strict monitoring of PBW"],
        "irrigation": "Critical irrigation stage",
        "fertilizer": "Foliar spray of 2% Urea or KNO3",
        "pest_disease": "Pink Bollworm, Spotted Bollworm, Boll rot"
      },
      {
        "name": "Boll Opening & Harvest",
        "duration_days": 35,
        "description": "Bolls mature, open, exposing lint.",
        "care_tips": ["Stop irrigation", "Pick cotton when bolls are fully open", "Pick in morning to avoid dry leaf trash"],
        "irrigation": "Stop irrigation",
        "fertilizer": "None",
        "pest_disease": "Stainer bugs"
      }
    ]
  },
  "jute": {
    "display_name": "Jute (जूट)",
    "type": "fiber",
    "season": "kharif",
    "total_duration_days": 120,
    "sowing_months": [3, 4],
    "harvest_months": [7, 8],
    "suitable_regions": ["West Bengal", "Bihar", "Assam", "Odisha", "Meghalaya"],
    "stages": [
      {
        "name": "Germination",
        "duration_days": 10,
        "description": "Seed sprouting.",
        "care_tips": ["Fine seedbed preparation is crucial", "Sow with pre-monsoon showers", "Maintain superficial moisture"],
        "irrigation": "Light irrigation if no rain",
        "fertilizer": "Basal NPK",
        "pest_disease": "Field cricket, Cutworm"
      },
      {
        "name": "Vegetative",
        "duration_days": 50,
        "description": "Rapid vertical growth of stem.",
        "care_tips": ["Thinning and weeding at 20-25 days", "Apply Nitrogen top dressing", "Monitor for semilooper"],
        "irrigation": "Irrigate based on rainfall",
        "fertilizer": "Top dressing of Nitrogen at 3-4 weeks",
        "pest_disease": "Jute semilooper, Stem weevil, Hairy caterpillar"
      },
      {
        "name": "Flowering",
        "duration_days": 20,
        "description": "Emergence of small flowers.",
        "care_tips": ["Prepare for harvest (harvest at 50% flowering for best fiber)", "Ensure standing water is not too deep", "Monitor pests"],
        "irrigation": "Usually rainfed (monsoon active)",
        "fertilizer": "None",
        "pest_disease": "Yellow mite, Stem rot"
      },
      {
        "name": "Fiber Development",
        "duration_days": 25,
        "description": "Stem matures and fiber thickens.",
        "care_tips": ["Harvesting starts from small pod stage", "Avoid over-maturity which makes fiber coarse"],
        "irrigation": "Rainfed",
        "fertilizer": "None",
        "pest_disease": "Stem rot"
      },
      {
        "name": "Harvest & Retting",
        "duration_days": 15,
        "description": "Cutting plants, tying in bundles, and steeping in water.",
        "care_tips": ["Harvest close to ground", "Steep bundles in clean, slow-flowing water", "Extract fiber when retting is complete (10-15 days)"],
        "irrigation": "Requires water bodies for retting",
        "fertilizer": "None",
        "pest_disease": "None"
      }
    ]
  },
  "coffee": {
    "display_name": "Coffee (कॉफी)",
    "type": "plantation",
    "season": "perennial",
    "total_duration_days": 260,
    "sowing_months": [6, 7, 8],
    "harvest_months": [11, 12, 1],
    "suitable_regions": ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Odisha"],
    "stages": [
      {
        "name": "Dormancy & Blossom Shower",
        "duration_days": 30,
        "description": "Resting phase followed by crucial blossom showers (Feb-March).",
        "care_tips": ["Provide artificial sprinkler irrigation if blossom showers fail", "Pruning and shade regulation", "Pre-blossom manuring"],
        "irrigation": "Crucial sprinkler irrigation (25-30mm) for blossom",
        "fertilizer": "Pre-blossom application of NPK",
        "pest_disease": "Coffee white stem borer (tracing)"
      },
      {
        "name": "Flowering",
        "duration_days": 20,
        "description": "Blooming of white, fragrant flowers.",
        "care_tips": ["Ensure 'backing showers' 2-3 weeks after blossom", "Avoid disturbing plants", "Monitor for pests"],
        "irrigation": "Backing showers/irrigation essential for fruit set",
        "fertilizer": "None",
        "pest_disease": "Thrips"
      },
      {
        "name": "Pin Head Stage",
        "duration_days": 30,
        "description": "Tiny fruits form and remain dormant briefly.",
        "care_tips": ["Monitor for coffee berry borer", "Maintain optimal shade", "Weed control"],
        "irrigation": "Maintain soil moisture",
        "fertilizer": "None",
        "pest_disease": "Coffee Berry Borer (CBB), Leaf rust"
      },
      {
        "name": "Berry Expansion",
        "duration_days": 60,
        "description": "Rapid growth of berries.",
        "care_tips": ["Post-monsoon manuring", "Spray Bordeaux mixture for rust", "Install CBB traps"],
        "irrigation": "Usually monsoon season; ensure drainage",
        "fertilizer": "Post-monsoon NPK application",
        "pest_disease": "Coffee leaf rust, Black rot, CBB"
      },
      {
        "name": "Berry Ripening",
        "duration_days": 90,
        "description": "Berries mature and turn red (cherries).",
        "care_tips": ["Monitor for ripe cherries", "Control CBB", "Prepare pulping equipment"],
        "irrigation": "Rainfed",
        "fertilizer": "Foliar nutrients if required",
        "pest_disease": "CBB, Mealybug"
      },
      {
        "name": "Harvest",
        "duration_days": 30,
        "description": "Selective picking of ripe red cherries.",
        "care_tips": ["Hand-pick only fully ripe red cherries", "Process (pulp) on the same day", "Dry parchment coffee carefully"],
        "irrigation": "None",
        "fertilizer": "None",
        "pest_disease": "None"
      }
    ]
  }
}

with open('/Users/devanshsaraswat/Documents/KrishiVani/backend/app/data/crop_lifecycle.json', 'w') as f:
    json.dump(data, f, indent=2)
