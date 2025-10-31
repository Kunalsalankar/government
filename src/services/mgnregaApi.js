// MGNREGA API Service
// Loads and serves data from the Maharashtra CSV via parseMahaCsv

import cacheService from './cacheService';
import { loadMaharashtraData } from '../data/parseMahaCsv';

class MgnregaApiService {
  async _getAllDistricts() {
    return await loadMaharashtraData();
  }

  // Get district performance data
  async getDistrictData(stateName, districtName) {
    const cacheKey = `district_${stateName}_${districtName}`;
    return cacheService.getData(cacheKey, async () => {
      const all = await this._getAllDistricts();
      const data = all.find(d => d.districtName === districtName);
      if (!data) throw new Error('District data not found');
      // Data already structured by parser; return as-is
      return data;
    });
  }
  
  // Get comparative data for multiple districts
  async getComparativeData(stateName, districts) {
    const cacheKey = `comparative_${stateName}_${districts.join('_')}`;
    return cacheService.getData(cacheKey, async () => {
      const all = await this._getAllDistricts();
      return districts.map(name => {
        const d = all.find(x => x.districtName === name);
        if (!d) return null;
        // Ensure minimal shape expected by DistrictComparison
        return {
          districtName: d.districtName,
          currentMonthData: {
            householdsEmployed: d.currentMonthData.householdsEmployed || 0,
            totalExpenditure: d.currentMonthData.totalExpenditure || 0,
            womenParticipation: d.currentMonthData.womenParticipation || 0
          }
        };
      }).filter(Boolean);
    });
  }
  
  // Get state-level performance data
  async getStateData(stateName) {
    const cacheKey = `state_${stateName}`;
    return cacheService.getData(cacheKey, async () => {
      const all = await this._getAllDistricts();
      const totalJobCards = all.reduce((s, d) => s + (d.currentMonthData.jobCardsIssued || 0), 0);
      const totalWorkers = all.reduce((s, d) => s + (d.currentMonthData.workersRegistered || 0), 0);
      const totalHouseholds = all.reduce((s, d) => s + (d.currentMonthData.householdsEmployed || 0), 0);
      const totalExpenditure = all.reduce((s, d) => s + (d.currentMonthData.totalExpenditure || 0), 0);
      return {
        stateName,
        totalJobCards,
        totalWorkers,
        totalHouseholds,
        totalExpenditure,
        districtCount: all.length
      };
    });
  }

  async getDistrictList() {
    const cacheKey = `district_list_maharashtra`;
    return cacheService.getData(cacheKey, async () => {
      const all = await this._getAllDistricts();
      return all.map(d => d.districtName).sort((a, b) => a.localeCompare(b));
    });
  }
}

const mgnregaApi = new MgnregaApiService();
export default mgnregaApi;