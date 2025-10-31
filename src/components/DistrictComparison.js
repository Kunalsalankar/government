import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow
} from '@mui/material';
import { useLanguage, translations } from '../context/LanguageContext';
import mgnregaApi from '../services/mgnregaApi';

const DistrictComparison = ({ stateName, currentDistrict, nearbyDistricts = [] }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const text = translations.dashboard[language] || {};

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!stateName || !currentDistrict) {
        setError('Missing required data');
        setLoading(false);
        return;
      }

      try {
        const districtsToCompare = [currentDistrict, ...(nearbyDistricts || [])].filter(Boolean);
        const data = await mgnregaApi.getComparativeData(stateName, districtsToCompare);
        setComparisonData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        setError('Failed to fetch comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [stateName, currentDistrict, nearbyDistricts]);

  if (loading) {
    return <Typography>Loading comparison data...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!comparisonData.length) {
    return <Typography>No comparison data available</Typography>;
  }

  const renderCell = (district, field) => {
    try {
      const value = district?.currentMonthData?.[field];
      if (field === 'totalExpenditure') {
        return value ? `${(value / 100).toFixed(2)} Cr` : 'N/A';
      }
      if (field === 'womenParticipation') {
        return value ? `${value}%` : 'N/A';
      }
      return value?.toLocaleString() || 'N/A';
    } catch (err) {
      return 'N/A';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {text.districtComparison || "District Comparison"}
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{language === 'hindi' ? 'मीट्रिक' : 'Metric'}</strong></TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'}>
                  {district?.districtName || 'Unknown District'}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{text.householdsEmployed || 'Households Employed'}</TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'}>
                  {renderCell(district, 'householdsEmployed')}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>{text.totalExpenditure || 'Total Expenditure (₹)'}</TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'}>
                  {renderCell(district, 'totalExpenditure')}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>{text.womenParticipation || 'Women Participation (%)'}</TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'}>
                  {renderCell(district, 'womenParticipation')}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DistrictComparison;