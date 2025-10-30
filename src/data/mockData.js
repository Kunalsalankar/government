// Mock data for MGNREGA district performance
// This simulates the data structure we would expect from the API

const states = [
  {
    id: 1,
    name: "Uttar Pradesh",
    districts: [
      "Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich",
      "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr",
      "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar"
    ]
  },
  {
    id: 2,
    name: "Maharashtra",
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
      "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
      "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara"
    ]
  },
  {
    id: 3,
    name: "Bihar",
    districts: [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran",
      "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
      "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur"
    ]
  }
];

// Generate performance data for each district
const generatePerformanceData = (districtName, stateName) => {
  // Generate random data for the past 12 months
  const monthlyData = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    monthlyData.push({
      month: date.toLocaleString('default', { month: 'long' }),
      year: date.getFullYear(),
      jobCardsIssued: Math.floor(Math.random() * 5000) + 1000,
      workersRegistered: Math.floor(Math.random() * 10000) + 5000,
      householdsEmployed: Math.floor(Math.random() * 4000) + 1000,
      personDaysGenerated: Math.floor(Math.random() * 100000) + 50000,
      averageWageRate: Math.floor(Math.random() * 100) + 200,
      totalExpenditure: Math.floor(Math.random() * 10000000) + 5000000,
      womenParticipation: Math.floor(Math.random() * 30) + 40, // percentage
      scParticipation: Math.floor(Math.random() * 20) + 10, // percentage
      stParticipation: Math.floor(Math.random() * 15) + 5, // percentage
      completedWorks: Math.floor(Math.random() * 200) + 50,
      ongoingWorks: Math.floor(Math.random() * 100) + 20,
    });
  }
  
  return {
    districtName,
    stateName,
    currentMonthData: monthlyData[0],
    historicalData: monthlyData,
    performanceIndicators: {
      employmentGeneration: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      wagePaymentEfficiency: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      inclusionOfMarginalized: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      workCompletion: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      overallPerformance: Math.floor(Math.random() * 5) + 1, // 1-5 rating
    }
  };
};

// Generate district data for all states
const districtData = [];

states.forEach(state => {
  state.districts.forEach(district => {
    districtData.push(generatePerformanceData(district, state.name));
  });
});

export { states, districtData };