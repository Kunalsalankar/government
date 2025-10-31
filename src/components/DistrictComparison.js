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
        return value ? `${(parseFloat(value) / 100000).toFixed(2)}%` : 'N/A';
      }
      return value?.toLocaleString() || 'N/A';
    } catch (err) {
      return 'N/A';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        color="primary"
        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
      >
        {text.districtComparison || "District Comparison"}
      </Typography>
      
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                {language === 'hindi' ? 'मीट्रिक' : 'Metric'}
              </TableCell>
              {comparisonData.map(district => (
                <TableCell 
                  key={district?.districtName || 'unknown'}
                  sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  {district?.districtName || 'Unknown District'}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {text.householdsEmployed || 'Households Employed'}
              </TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {renderCell(district, 'householdsEmployed')}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {text.totalExpenditure || 'Total Expenditure (₹)'}
              </TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {renderCell(district, 'totalExpenditure')}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {text.womenParticipation || 'Women Participation'}
              </TableCell>
              {comparisonData.map(district => (
                <TableCell key={district?.districtName || 'unknown'} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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