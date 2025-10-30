import React, { createContext, useState, useContext } from 'react';

// Create language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('english'); // Default language is English

  // Toggle language between Hindi and English
  const toggleLanguage = () => {
    setLanguage(language === 'hindi' ? 'english' : 'hindi');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => useContext(LanguageContext);

// Text content for both languages
export const translations = {
  header: {
    hindi: {
      title: 'MGNREGA जानकारी',
      subtitle: 'हमारी आवाज़, हमारे अधिकार'
    },
    english: {
      title: 'MGNREGA Information',
      subtitle: 'Our Voice, Our Rights'
    }
  },
  homePage: {
    hindi: {
      mainTitle: 'MGNREGA जानकारी',
      subtitle: 'अपने जिले का प्रदर्शन जानें',
      description1: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA) भारत सरकार का एक प्रमुख कार्यक्रम है जो ग्रामीण परिवारों को रोजगार प्रदान करता है।',
      description2: 'अपने जिले का प्रदर्शन देखने के लिए, नीचे अपना राज्य और जिला चुनें या अपना स्थान पता करें।',
      stateSelect: 'राज्य चुनें',
      districtSelect: 'जिला चुनें',
      viewData: 'जानकारी देखें',
      detectLocation: 'अपना स्थान पता करें',
      whatIsMgnrega: 'MGNREGA क्या है?',
      whatIsMgnregaDesc: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA) ग्रामीण परिवारों को हर वित्तीय वर्ष में कम से कम 100 दिनों का गारंटीशुदा मजदूरी रोजगार प्रदान करता है।',
      benefitsAndRights: 'लाभ और अधिकार',
      benefitsAndRightsDesc: 'MGNREGA के तहत, आपको समय पर मजदूरी, काम की जगह पर सुविधाएँ, और बेरोजगारी भत्ता पाने का अधिकार है अगर आपको 15 दिनों के भीतर काम नहीं मिलता।',
      districtPerformance: 'जिला प्रदर्शन',
      districtPerformanceDesc: 'अपने जिले के प्रदर्शन को देखकर आप जान सकते हैं कि कितने परिवारों को रोजगार मिला, कितना पैसा खर्च हुआ, और कितने काम पूरे हुए।',
      locationError: 'आपका स्थान पता नहीं चल सका। कृपया अपना जिला चुनें।',
      browserError: 'आपका ब्राउज़र लोकेशन का समर्थन नहीं करता है। कृपया अपना जिला चुनें।'
    },
    english: {
      mainTitle: 'MGNREGA Information',
      subtitle: 'Check Your District Performance',
      description1: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) is a flagship program of the Government of India that provides employment to rural households.',
      description2: 'To view your district\'s performance, select your state and district below or detect your location.',
      stateSelect: 'Select State',
      districtSelect: 'Select District',
      viewData: 'View Information',
      detectLocation: 'Detect Your Location',
      whatIsMgnrega: 'What is MGNREGA?',
      whatIsMgnregaDesc: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) provides at least 100 days of guaranteed wage employment to rural households in every financial year.',
      benefitsAndRights: 'Benefits and Rights',
      benefitsAndRightsDesc: 'Under MGNREGA, you have the right to timely wages, facilities at worksite, and unemployment allowance if you are not provided work within 15 days.',
      districtPerformance: 'District Performance',
      districtPerformanceDesc: 'By viewing your district\'s performance, you can know how many households got employment, how much money was spent, and how many works were completed.',
      locationError: 'Could not detect your location. Please select your district manually.',
      browserError: 'Your browser does not support location detection. Please select your district manually.'
    }
  },
  dashboard: {
    hindi: {
      backButton: 'वापस जाएं',
      dashboardTitle: 'MGNREGA प्रदर्शन डैशबोर्ड',
      jobCardsIssued: 'जारी किए गए जॉब कार्ड',
      workersRegistered: 'पंजीकृत श्रमिक',
      householdsEmployed: 'रोजगार प्राप्त परिवार',
      totalExpenditure: 'कुल व्यय (₹)',
      crore: 'करोड़',
      performanceTab: 'प्रदर्शन सूचकांक',
      monthlyDataTab: 'मासिक डेटा',
      participationTab: 'भागीदारी विश्लेषण',
      performanceIndicators: 'प्रदर्शन सूचकांक',
      employmentGeneration: 'रोजगार सृजन',
      wagePayment: 'मजदूरी भुगतान दक्षता',
      inclusion: 'हाशिए वर्गों का समावेश',
      workCompletion: 'कार्य पूर्णता',
      overallPerformance: 'समग्र प्रदर्शन',
      scaleDescription: 'प्रदर्शन सूचकांक 1 से 5 तक के पैमाने पर आधारित हैं, जहां 1 सबसे कम और 5 सबसे अधिक है।',
      personDaysTitle: 'पिछले 12 महीनों में उत्पन्न व्यक्ति-दिवस',
      personDays: 'व्यक्ति-दिवस',
      personDaysDesc: 'व्यक्ति-दिवस: एक व्यक्ति द्वारा एक दिन में किए गए काम की इकाई',
      participationTitle: 'भागीदारी विश्लेषण (प्रतिशत में)',
      women: 'महिलाएं',
      sc: 'अनुसूचित जाति',
      st: 'अनुसूचित जनजाति',
      others: 'अन्य',
      additionalInfo: 'अतिरिक्त जानकारी',
      wageRate: 'औसत मजदूरी दर',
      perDay: 'प्रति दिन',
      completedWorks: 'पूरे किए गए कार्य',
      ongoingWorks: 'चालू कार्य',
      womenParticipation: 'महिला भागीदारी',
      scParticipation: 'अनुसूचित जाति भागीदारी',
      stParticipation: 'अनुसूचित जनजाति भागीदारी',
      loading: 'जानकारी लोड हो रही है...',
      noData: 'जिले की जानकारी नहीं मिली'
    },
    english: {
      backButton: 'Go Back',
      dashboardTitle: 'MGNREGA Performance Dashboard',
      jobCardsIssued: 'Job Cards Issued',
      workersRegistered: 'Workers Registered',
      householdsEmployed: 'Households Employed',
      totalExpenditure: 'Total Expenditure (₹)',
      crore: 'Crore',
      performanceTab: 'Performance Indicators',
      monthlyDataTab: 'Monthly Data',
      participationTab: 'Participation Analysis',
      performanceIndicators: 'Performance Indicators',
      employmentGeneration: 'Employment Generation',
      wagePayment: 'Wage Payment Efficiency',
      inclusion: 'Inclusion of Marginalized',
      workCompletion: 'Work Completion',
      overallPerformance: 'Overall Performance',
      scaleDescription: 'Performance indicators are based on a scale of 1 to 5, where 1 is lowest and 5 is highest.',
      personDaysTitle: 'Person-Days Generated in Last 12 Months',
      personDays: 'Person-Days',
      personDaysDesc: 'Person-Day: A unit of work done by one person in one day',
      participationTitle: 'Participation Analysis (in percentage)',
      women: 'Women',
      sc: 'Scheduled Caste',
      st: 'Scheduled Tribe',
      others: 'Others',
      additionalInfo: 'Additional Information',
      wageRate: 'Average Wage Rate',
      perDay: 'per day',
      completedWorks: 'Completed Works',
      ongoingWorks: 'Ongoing Works',
      womenParticipation: 'Women Participation',
      scParticipation: 'SC Participation',
      stParticipation: 'ST Participation',
      loading: 'Loading information...',
      noData: 'District information not found'
    }
  },
  footer: {
    hindi: {
      copyright: '© {year} MGNREGA जानकारी | हमारी आवाज़, हमारे अधिकार',
      dataSource: 'डेटा स्रोत:'
    },
    english: {
      copyright: '© {year} MGNREGA Information | Our Voice, Our Rights',
      dataSource: 'Data Source:'
    }
  }
};