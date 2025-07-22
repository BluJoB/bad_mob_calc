# Bad Mobilization Cost Calculator

An open source tool to quantify the true cost impact of mobilization failures in construction projects. Built by Harlan Charles & TIA Works Community.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🚨 The Hidden Crisis in Construction

- **78%** of construction workers experience idle time weekly (Harvard Business School)
- **5.5 hours** weekly spent by PMs searching for project data (FMI Corporation)
- **60-80%** industry-wide mobilization failure rate accepted as "normal"
- **5-20x** cascade effect - true costs far exceed visible direct costs

## 🎯 What This Calculator Does

The Bad Mobilization Calculator reveals the complete financial impact of mobilization failures through a three-layer cost analysis:

### Layer 1: Direct Costs
- Labor costs (including 35% burden rate)
- Transportation expenses (fuel + vehicle wear)
- Equipment idle time

### Layer 2: Cascade Costs
- Trade coordination delays
- Schedule compression expenses
- Fixed overhead losses

### Layer 3: Strategic Costs
- Remobilization expenses
- Customer relationship damage
- Future revenue at risk

## 🚀 Quick Start Guide

### Option 1: Use Online (Recommended)
Visit the live calculator at: [https://hc-build.com/tools/bad-mob-calc](https://hc-build.com/tools/bad-mob-calc)

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/BluJoB/bad_mob_calc.git
   cd bad_mob_calc
   ```

2. Open in browser:
   ```bash
   # On Mac
   open index.html
   
   # On Windows
   start index.html
   
   # On Linux
   xdg-open index.html
   ```

### Option 3: Deploy Your Own Instance

#### Deploy to Render (Free)
1. Fork this repository to your GitHub account
2. Click the "Deploy to Render" button above
3. Connect your GitHub account
4. Select your forked repository
5. Use these settings:
   - **Environment**: Static Site
   - **Build Command**: (leave empty)
   - **Publish Directory**: `.`
6. Click "Create Static Site"

Your calculator will be live at `https://[your-app-name].onrender.com`

#### Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Set Source to "Deploy from a branch"
4. Select "main" branch and "/" (root) folder
5. Click Save

Your calculator will be live at `https://[your-username].github.io/bad_mob_calc`

#### Deploy to Netlify
1. Fork this repository
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your fork
5. Click "Deploy site"

## 📊 How to Use the Calculator

1. **Enter Basic Project Information**
   - Crew size (number of workers)
   - Average hourly rate
   - Distance to job site
   - Project complexity level

2. **Specify Mobilization Failure Details**
   - Hours lost to bad mobilization
   - Equipment daily rates
   - Number of vehicles involved
   - Whether remobilization is required

3. **Add Business Impact Factors**
   - Annual company revenue
   - Customer lifetime value
   - Frequency of bad mobilizations
   - Company overhead rate

4. **Review Your Results**
   - See costs broken down by layer
   - View per-incident and annual impacts
   - Export results as CSV
   - Share analysis with stakeholders

## 🔬 Research-Based Methodology

All calculations are based on industry research:
- **Harvard Business School**: Worker idle time studies
- **FMI Corporation**: Construction productivity research
- **AAA**: Vehicle operating cost data ($0.67/mile fuel, $0.40/mile wear)
- **Bureau of Labor Statistics**: Construction wage benchmarks

### Core Formula
```
Total Cost = DC + CC + FCL + CI + SI + RM + FRL × Complexity

Where:
DC = Direct Costs
CC = Cascade Costs
FCL = Fixed Cost Loss
CI = Customer Impact
SI = Schedule Impact
RM = Remobilization
FRL = Future Revenue Loss
```

## 🛠️ Technical Details

### Technology Stack
- Pure HTML/CSS/JavaScript (no build process required)
- Mobile-first responsive design
- Progressive enhancement
- Offline-capable
- Zero dependencies

### Browser Support
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use 4 spaces for indentation
- Follow existing naming conventions
- Add comments for complex calculations
- Test on mobile and desktop

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core calculator functionality
- ✅ Three-layer cost analysis
- ✅ Export to CSV
- ✅ Mobile-responsive design

### Phase 2
- [ ] Enhanced reporting with PDF export
- [ ] Historical data tracking
- [ ] Multi-project comparison
- [ ] Industry benchmarking

### Phase 3
- [ ] API for integrations
- [ ] Project management system connectors
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

### Phase 4
- [ ] Mobile app (iOS/Android)
- [ ] Offline data sync
- [ ] Enterprise features
- [ ] White-label options

## 📊 Success Metrics

Track your impact:
- Mobilization failures identified
- Costs quantified and prevented
- Process improvements implemented
- ROI on prevention systems

## 🙏 Acknowledgments

- Harvard Business School for idle time research
- FMI Corporation for construction productivity data
- AAA for vehicle operating cost research
- The construction community for ongoing feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 About TIA Works

This calculator demonstrates the value of intelligent project controls. Learn how TIA Works can help prevent mobilization failures at [tiaworks.com](https://tiaworks.com).

---

**Questions?** Open an [issue](https://github.com/BluJoB/bad_mob_calc/issues) or reach out to the community.

**Found this useful?** Star ⭐ the repository and share with your network!