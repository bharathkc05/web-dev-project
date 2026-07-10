import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const data = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5756, 12.9782]
      },
      "properties": {
        "location_name": "Kapali Mall, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Shop No.G-05 Ground Floor, Kapali Mall, Subedhar Chatram Road Gandhinagar, Bengaluru, Karnataka-560009",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5684, 12.9426]
      },
      "properties": {
        "location_name": "Gandhi Bazar, Bangalore",
        "store_timing": "9.00 AM-1.00 AM",
        "address": "59/3, Ground Floor & First Floor, West Anjaneya Temple Road, Ward No.49",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5638, 12.9816]
      },
      "properties": {
        "location_name": "Lulu Mall, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "No.19/2, Global Mall, Unit No.F & B 08, 2nd Floor, Food Court, Ramachandrapura,Rajajinagar, Bangalore, Malleshwaram ,B.B.M.P North, Karnataka-560023",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5543, 12.9592]
      },
      "properties": {
        "location_name": "Gopalan Legacy Mall, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Municipal No.148, (Old No.125/1), G-2, Gopalan Legacy Mall, Mysore Road, Division No.33, Bengaluru, Chikkapete, B.B.M.P West, Karnataka-560076",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5501, 12.9754]
      },
      "properties": {
        "location_name": "GT Mall, Bangalore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Counter No-1,Food Court,Third Floor,GT Mall,No.92,Magadi Road , Next to Prasanna Theatre,Bangalore - 560023",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5714, 12.9918]
      },
      "properties": {
        "location_name": "Mantri Mall, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Unit number UG 49, Upper Ground Floor Mantri Square, Number 3, Sampige Road, Malleshwaram,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6115, 12.9822]
      },
      "properties": {
        "location_name": "Area Commercial Street, Bangalore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Unit no 111/4, and 8/2, Asha Gallary, Opposite to West Side, Commercial Street,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5918, 12.9272]
      },
      "properties": {
        "location_name": "Jayanagar, Bangalore",
        "store_timing": "9.00 AM-3.00 AM",
        "address": "Showroom No. 1, No. 653/67, 11th Main Road, Next to Bata showroom, Jayanagar,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5372, 12.9254]
      },
      "properties": {
        "location_name": "Banashankari, Bangalore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Sri Hari Ozone, Shop No.2, Ground Floor,Plot No.4, Sy No.17/19, 30th Main Road, Opp.KIMS, Kaveri Nagar, Banagirinagar Village,Kathriguppe, Banashankari 3rd Stage,Bengaluru, Basavanagudi , B.B.M.P South,Karnataka-560085",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5303, 12.9645]
      },
      "properties": {
        "location_name": "Vijayanagar, Bangalore",
        "store_timing": "10.00 AM-3.45 AM",
        "address": "No 18, PID NO 35-3-18, U.G.F., 17th Cross, Behind Maruthi Mandir Bus Stop, MC Layout, Magadi Cord Road, Vijayanagar, Bangalore, Vijayanagara, B.B.M.P West, Karnataka-560040",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6113, 12.9344]
      },
      "properties": {
        "location_name": "Forum Mall, Koramangala",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "2nd Floor, Inside Transit Food Court, Forum mall, 21 Hosur Road, Stage 1, Koramangala,Bangalore",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6225, 12.9304]
      },
      "properties": {
        "location_name": "Koramangala Bangalore",
        "store_timing": "7.00 AM-6.00 AM",
        "address": "114 Ground Floor, 7th block",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5354, 12.9868]
      },
      "properties": {
        "location_name": "Basaveshwar - Bangalore",
        "store_timing": "8.00 AM-3.45 AM",
        "address": "Burger King India Limited Unit 722/1, Ground Floor Savitru Elegance Magadi Rd, WCR Road Bangalore 560086 Land mark : Right side of Unlimited",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5543, 12.9554]
      },
      "properties": {
        "location_name": "Orion Mall, Banglore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Shop No. 4, 2nd floor, Orion Mall, Municipal No. 26/1, 80' road, Dr. Rajkumar road, Subramanyanagar, Municipal Ward No. 9A, Rajajinagar extension, Bangalore 560055",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5284, 12.9463]
      },
      "properties": {
        "location_name": "Global Divinity Mall, Bangalore",
        "store_timing": "11.00 AM-11.00 PM",
        "address": "Counter No. 7 & 8 on Third Floor (Food Court) clubbed, Global Malls, Salarpuria Sattva Divijity, Mysore road Pantharpalya, Mysore Road, Nayandalli, Kengeri Hobli – Bangalore",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6083, 12.9154]
      },
      "properties": {
        "location_name": "BTM Layout Bangalore",
        "store_timing": "9.00 AM-1.00 AM",
        "address": "No.4, Ground floor, 2nd stage, 100ft Ring road, BTM Layout, Bengaluru, BTM Layout, B.B.M.P south, Karnataka, 560076",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5932, 13.0184]
      },
      "properties": {
        "location_name": "RT Nagar, Bangalore",
        "store_timing": "10.00 AM-3.00 AM",
        "address": "No.415, Ground Floor, 1st Block, Matadahalli Extension, Manorayanapalya, RT Nagar, Bengaluru, Hebbala, B.B.M.P North, Karnataka-560032",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6012, 12.9135]
      },
      "properties": {
        "location_name": "Vegacity mall, Bangalore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Burger King India Ltd, Unit No - QSR -1 #rd Floor , Vega City Mall, Srinivas Industrial Estate Bannerghatta Road Bangalore - 560076",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6385, 12.9784]
      },
      "properties": {
        "location_name": "Indiranagar, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Salarpuria Plaza, No. 543, CMH Road, Near Indira Nagar Metro Station",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5147, 12.9348]
      },
      "properties": {
        "location_name": "Gopalan Arcade, Bengalaru",
        "store_timing": "10.00 AM-3.45 AM",
        "address": "No.447/18/2, Gopalan Arcade Mall, Food Court, Unit No.G-10 & G-11, Ground Floor, RR Nagar 1st Block, Mysore Road, Bangalore, R R Nagara , B.B.M.P West, Karnataka-560098",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5684, 13.0305]
      },
      "properties": {
        "location_name": "New Bel Road, Bangalore",
        "store_timing": "9.00 AM-5.00 AM",
        "address": "Burger King Restaurant ,No.48 , Casino Tower , Opp Ms. Ramaiah Hospital ,New Bell Road,RMV 2nd Stage ,Deva Sandra ,Bangalore -560054.",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5621, 12.8732]
      },
      "properties": {
        "location_name": "Forum Falcon, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Burger King , 4th Floor , Kitchen No. 4F-402 , Forum Falcon city , No. 31 , Konankunte Village , Uttarahalli Hobli , Bangalore south Taluk , Bangalore - 560062",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6424, 12.9105]
      },
      "properties": {
        "location_name": "HSR - Bangalore",
        "store_timing": "7.00 AM-1.00 AM",
        "address": "Burger King India Ltd, No.1081 Ground floor , HSR layout Sector -3 Bangalore 560102",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6372, 13.0094]
      },
      "properties": {
        "location_name": "Kammanahalli - Bangalore",
        "store_timing": "7.00 AM-1.00 AM",
        "address": "New Municipal Katha No.59/1 (Old No 59), 4th Cross, Chikka Muniyappa Reddy Circle Road, Kammanahalli Main Road, HRBR Layout",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6621, 12.9934]
      },
      "properties": {
        "location_name": "Gopalan signature Mall, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "No.6, Gopalan Signature Mall, Shop No.GF-1C, Ground Floor, Old Madras Road, Nagavara Palya, C.V.Raman Nagar, Bangalore, Sarvagna Nagar , B.B.M.P East, Karnataka-560038",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5954, 12.8756]
      },
      "properties": {
        "location_name": "Royal Meenakshi Mall - Bangalore",
        "store_timing": "10.00 AM-2.00 AM",
        "address": "Burgerking India Ltd. Unit No-T001B & T007, Royal Meenakasi Mall, 3rd Floor, Opp. Meenakshi Temple, Hulimavu, Bannerghatta Road, Bangalore-560076",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6267, 13.0454]
      },
      "properties": {
        "location_name": "Elements Mall, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Burger King India Ltd. Unit No.FCK/04, Fourth floor,Elements mall, Thanisandra Main rd, Bangalore - 560077",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6743, 12.9284]
      },
      "properties": {
        "location_name": "Bellandur - Bengaluru",
        "store_timing": "8.00 AM-6.00 AM",
        "address": "Sy No.78/10 Ground floor, RR Pyramid building, Outer Ring Rd,beside Centro mall, Bellandur, Bengaluru, Karnataka 560103",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5929, 13.0531]
      },
      "properties": {
        "location_name": "Mall of Asia, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Unit No.T-35, 3rd Floor, The Mall of Asia,Byatarayanapura Village, Yelahanka Hobli,Bengaluru,Yelahanka, B.B.M.P North,Karnataka-560092",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5583, 13.0784]
      },
      "properties": {
        "location_name": "Vidyaranyapura Bangalore",
        "store_timing": "9.00 AM-1.00 AM",
        "address": "Site No. 570, Ground Floor, BBMP Katha No. 543/2223/570, in Sy. Nos. 34 to 39, 41 to 51(Portion), Situated at Narasipura Village, Vidyaranyapura Zone, Yelahanka Hobli, Bangalore North Taluk, Bengaluru, Karnataka 560097",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6892, 12.9134]
      },
      "properties": {
        "location_name": "Sarjapur, Bangalore",
        "store_timing": "8.00 AM-1.00 AM",
        "address": "Burger King, Surjapur road, Dodda Kannali",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6912, 13.0232]
      },
      "properties": {
        "location_name": "TC Palya Main Road, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Ground & First Floor, No 14, 11th main, TC Palya Main road, Akshay Nagar, Aneppa Circle, Rammurthy Nagar, Bangalore - 560016",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6964, 12.9958]
      },
      "properties": {
        "location_name": "PMC B, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Unit No.S 08 on Second Floor, Pheonix Marketcity Mall, Bengaluru East, Mahadev Pura, NR KR Puram Flyover",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7011, 12.9612]
      },
      "properties": {
        "location_name": "Marathalli, Bangalore",
        "store_timing": "9.00 AM-11.00 PM",
        "address": "755/95/3, Ground Floor, Kote M R Plaza, Doddanekundi, Marathalli KR Puram Ring Road, Bangalore Karnataka 560037",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.52, 13.045]
      },
      "properties": {
        "location_name": "Hessarghatta, Bengaluru",
        "store_timing": "7.00 AM-1.00 AM",
        "address": "No 751, Hesarghatta Rd, Geleyara Balaga Layout, Jalahalli West, Bengaluru, Karnataka 560090",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.65, 13.058]
      },
      "properties": {
        "location_name": "Hennur Road, Bangalore",
        "store_timing": "9.00 AM-3.00 AM",
        "address": "No.125/2, Shop no 5. Ground Floor, Byrathi, Hennur- Bagalur Main Road, Kothanur, Dr Shivarama Karanth Nagar Post, Bangalore KR Puram, BBMP East, Karnataka - 560077",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.596, 13.095]
      },
      "properties": {
        "location_name": "RMZ Galleria, Bengaluru",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Shop no. 6 , Food court second floor, RMZ Galleria, Banglore Bellsry road, Yelahanka Post,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.634, 13.118]
      },
      "properties": {
        "location_name": "Yelahanka New Town, Bangalore",
        "store_timing": "7.00 AM-1.00 AM",
        "address": "plot no- 1256/1981/1759 prestige plaza mother dairy road Bellahalli Main Road, Kattigenahalli yelahanka , Bengaluru, Karnataka 560064",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6534, 12.8465]
      },
      "properties": {
        "location_name": "Electronic City, Bangalore",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "Burger King - #12 Ajmera Avenue, Neeladri Road, Elwctronic City Phase - 1, Bangalore 560100",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.68, 12.84]
      },
      "properties": {
        "location_name": "M5 Mall, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Unit No-FS 08, Level 4, M5IVE E-CITY MALL, Plot No.-1, P.No HBG2023202304111168, Sy No-17,18,19&20, Veerasandra industrial Area, Hosur Rd, opposite to Electronic City Flyover, Phase 2, Electronic City, Bengaluru, Karnataka-560100",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7345, 12.9867]
      },
      "properties": {
        "location_name": "Park Square, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Unit.no. G-9 &G-10,Ground Floor, Ascendas Park Square, ITPL, WhiteField Road,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5256, 12.8184]
      },
      "properties": {
        "location_name": "Kaggalipura Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Shop No.6, Old Sy No.192 & New Sy No.192/2,Ground Floor, Kaggalipura Village, Opp. To Brigade Meadows, Bangalore South, Karnataka-560082",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7463, 12.9594]
      },
      "properties": {
        "location_name": "Nexus Whitefield mall Banglore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Resturant Brands Asia limited  FC -11,3rd Floor  Nexus Whitefield Mall , White Filed Main road 560066 Karnataka",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7472, 12.9205]
      },
      "properties": {
        "location_name": "Brigade Uthopia, Bangalore",
        "store_timing": "10.00 AM-11.00 PM",
        "address": "Shop No. G10, Ground Floor, Paradise Block, Brigade Cornerstone Utopia, SH 35, Varthur Gunjur Main Road, Bengaluru, Karnataka 560087",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.6342, 13.1182]
      },
      "properties": {
        "location_name": "Bagalur Main Road, Bangalore",
        "store_timing": "9.00 AM-1.00 AM",
        "address": "Ground & First Floor, Situated at survey no 9, (Old survey no 120 earlier survey no 11), Village - Kattigenahalli, Jala Hobli, Bangalore North(Additional) Taluk, Bangalore - 560064",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.745, 13.055]
      },
      "properties": {
        "location_name": "Budigere, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Shop No. 5A, Property No. 96/1, Ground Floor, Saviraj Complex, Budigere cross, Cheema Sandra Bengaluru, Karnataka 560049",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.61, 13.155]
      },
      "properties": {
        "location_name": "Airport road, Bengaluru",
        "store_timing": "7.00 AM-1.00 AM",
        "address": "Burger King, Bellary Road, next to Adyar Anand Bhavan Hotel, Central Telecom Society,",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7014, 12.7932]
      },
      "properties": {
        "location_name": "Chandapura,Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Plot No.490 & 491, Ground Floor, Iggalur Village, Chandapura V.P., Attibele Hobli, Anekal Taluka,Bengaluru, Karnataka-562106",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.7712, 12.7794]
      },
      "properties": {
        "location_name": "Attibelle, Bangalore",
        "store_timing": "10.00 AM-11.59 PM",
        "address": "Sy No.359/2 360/1, Ground & 1st Floor, Unit No.20, Sarjapur Road, Anekal Taluk, Attibele, Bengaluru, Anekal, Bangalore Urban, Karnataka, 562107",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.2105, 12.6514]
      },
      "properties": {
        "location_name": "Channapatna DT, Karnataka",
        "store_timing": "10.00 AM-1.00 AM",
        "address": "New Khata No.331/80, Unit No.1, GF & 1stFloor, SM Infraa Food Village, Settihalli Village,Bangalore-Mysore Highway, Malur Hobli,Channapatna Taluk - Ramanagara District,Channapatna, Ramanagara, Karnataka-562160",
        "status": "Open Now",
        "distance": null,
        "estimated_travel_time": null,
        "available_services": ["Takeaway", "Dine-in", "Delivery"]
      }
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Import outlet model dynamically to ensure schema is loaded after connection
    const Outlet = (await import('./src/shared/models/outlet.model.js')).default;

    console.log('Clearing old outlets...');
    await Outlet.deleteMany({});
    
    console.log('Seeding new geospatial outlets...');
    const outletsToInsert = data.features.map(f => ({
      name: f.properties.location_name,
      address: f.properties.address,
      storeTiming: f.properties.store_timing,
      availableServices: f.properties.available_services,
      location: {
        type: 'Point',
        coordinates: f.geometry.coordinates // [lng, lat]
      },
      isApproved: true,
      isActive: true
    }));

    await Outlet.insertMany(outletsToInsert);
    console.log(`Successfully seeded ${outletsToInsert.length} outlets!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
