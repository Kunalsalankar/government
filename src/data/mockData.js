// Real Maharashtra MGNREGA district data, parsed from CSV
const { getParsedMahaData } = require('./parseMahaCsv');

// Build districts array from parsed data
const districtData = getParsedMahaData();
// District names from real data
const maharashtraDistricts = districtData.map(d => d.districtName);

const states = [{ id: 1, name: "Maharashtra", districts: maharashtraDistricts }];

module.exports = { states, districtData };