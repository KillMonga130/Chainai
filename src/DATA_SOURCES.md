# Data Sources & Attributions

Chain AI integrates with several key data sources to provide real-time humanitarian supply chain intelligence.

## 🌐 Primary Data Sources

### ReliefWeb API
**Provider:** United Nations Office for the Coordination of Humanitarian Affairs (OCHA)  
**URL:** https://reliefweb.int  
**API Documentation:** https://apidoc.reliefweb.int/  
**Usage:** Real-time humanitarian crisis reports, disaster information, and supply chain logistics data

**What we use:**
- Humanitarian situation reports
- Active disaster information
- Logistics and telecommunications updates
- Health and medical supply reports
- Country-specific crisis data

**Terms:**
- Public API with attribution requirement
- Data contributed by 600+ humanitarian organizations
- Free for humanitarian and educational purposes
- Respects intellectual property of original sources

### IBM watsonx Orchestrate
**Provider:** IBM Corporation  
**URL:** https://www.ibm.com/watsonx  
**Usage:** Multi-agent AI orchestration and reasoning framework

**What we use:**
- Agent coordination and orchestration
- ReAct reasoning framework
- Natural language processing
- Real-time analysis and recommendations
- Secure enterprise-grade AI infrastructure

**Terms:**
- Enterprise license for humanitarian operations
- Production-ready agent environment
- Secure cloud deployment

### OpenWeatherMap API
**Provider:** OpenWeather Ltd.  
**URL:** https://openweathermap.org  
**API Documentation:** https://openweathermap.org/api  
**Usage:** Real-time weather data for crisis zones to support logistics planning

**What we use:**
- Current weather conditions
- Temperature, humidity, wind speed
- Visibility and precipitation data
- Weather severity assessments
- Logistics impact analysis

**Terms:**
- Free tier API (60 calls/minute)
- Attribution required
- Weather data for location-based services
- Commercial use allowed with attribution

## 📊 Data Flow

```
ReliefWeb API + OpenWeatherMap API
    ↓
[Live Crisis Data + Weather Conditions]
    ↓
Chain AI Frontend
    ↓
IBM watsonx Orchestrate
    ↓
[5 Specialized Agents]
    ↓
Actionable Recommendations with Weather Impact
```

## 🔒 Privacy & Compliance

- **No PII Collection**: Chain AI does not collect personally identifiable information
- **Public Data Only**: All ReliefWeb data is publicly available humanitarian information
- **Attribution**: All sources are properly credited
- **Rate Limits**: Respects API quotas (1000 calls/day for ReliefWeb)
- **Caching**: Implements responsible caching to minimize API calls

## 📝 Attribution Requirements

When using data from Chain AI:

1. **Credit ReliefWeb**: "Data sourced from ReliefWeb.int by OCHA"
2. **Credit OpenWeatherMap**: "Weather data from OpenWeatherMap"
3. **Credit IBM**: "Powered by IBM watsonx Orchestrate"
4. **Credit Chain AI**: "Analysis by Chain AI multi-agent system"

## 🔄 Data Updates

- **ReliefWeb**: Updated continuously as organizations publish reports
- **OpenWeatherMap**: Updated every 10 minutes
- **Crisis Feed**: Refreshed on page load with real-time weather
- **Cache Duration**: 5 minutes for crisis data, 10 minutes for weather data

## 🌍 Data Coverage

### Geographic Coverage
- Global humanitarian crises
- Focus on disaster-affected regions
- Country-specific filtering available

### Temporal Coverage
- Real-time: Last 24-48 hours
- Historical: Full ReliefWeb archive (1996-present)
- Trend Analysis: Last 30 days by default

### Content Types
- Situation Reports
- News and Press Releases
- Analysis Papers
- Maps and Infographics
- Job Postings (logistics)
- Training Opportunities

## ⚖️ Legal & Licensing

### ReliefWeb Data
- **License**: Open for humanitarian use with attribution
- **Copyright**: Content owned by contributing organizations
- **Fair Use**: Educational and operational humanitarian purposes

### IBM watsonx Orchestrate
- **License**: Enterprise license for humanitarian operations
- **Terms**: IBM Cloud Terms of Service
- **Support**: Production SLA for humanitarian use cases

### OpenWeatherMap
- **License**: Free tier with attribution
- **Terms**: OpenWeatherMap Terms of Service
- **Attribution**: "Weather data provided by OpenWeatherMap"
- **API Key**: Secure key management for production use

### Chain AI Application
- **License**: © 2025 Chain AI, All rights reserved
- **Purpose**: Call for Code Global Challenge 2025
- **Use Case**: Humanitarian supply chain optimization

## 🤝 Acknowledgments

We are grateful to:

- **OCHA** for maintaining ReliefWeb as a free public resource
- **600+ Humanitarian Organizations** contributing to ReliefWeb
- **OpenWeatherMap** for providing weather data API
- **IBM** for providing enterprise AI infrastructure
- **Call for Code** for supporting humanitarian technology innovation

## 📞 Data Source Support

- **ReliefWeb Issues**: feedback@reliefweb.int
- **OpenWeatherMap**: https://openweathermap.org/appid
- **IBM watsonx**: IBM Support Portal
- **Chain AI**: Through app contact page

---

*Last Updated: November 3, 2025*
