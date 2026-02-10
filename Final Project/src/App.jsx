import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/module2/PortSureHome'
import Home from './component/HomePage'
import Trade from './component/module2/TradeCature'
import Di from './component/module2/Diversification'
import LoginPage from './component/module1/LoginPage1';
import Asset from './component/module1/AssetManager';
import Invest from './component/module1/InvestorDashboard';
import Regis from './component/module1/Register';
import InternalRegis from './component/module1/InternalRegister';
import Riskscore from './component/module3/RiskScoreScreen';
import Riskscore1 from './component/module3/ExposureAlertScreen';
import CompDash from './component/module4/ComplianceDashboard';
import CompLogs from './component/module4/ComplianceLogs';
import Per from './component/module5/PerformanceDashBoard';
import Re from './component/module5/ReportExport';
import Request from './component/module2/Request';
function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />}></Route>
            <Route path="/login-one" element={<LoginPage />} />
            <Route path="/asset-manager" element={<Asset />} />
            <Route path="/investordashboard" element={<Invest />} />
            <Route path="/regis" element={<Regis />}></Route>
            <Route path="/internal-regis" element={<InternalRegis />}></Route>
            <Route exact path="/investor-login" element={<Navbar />}></Route>

            <Route exact path="/Trade" element={<Trade />}></Route>
            <Route exact path="/Driver" element={<Di />}></Route>
            <Route exact path="/r" element={<Riskscore />}></Route>
            <Route exact path="/r1" element={<Riskscore1 />}></Route>

            <Route exact path="/C1" element={<CompDash />}></Route>
            <Route exact path="/C2" element={<CompLogs />}></Route>

            <Route exact path="/P1" element={<Per />}></Route>
            <Route exact path="/P2" element={<Re />}></Route>
            <Route exact path="/received-requests" element={<Request />}></Route>
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App;