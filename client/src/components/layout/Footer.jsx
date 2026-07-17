import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      className="text-[#BEBEBE] border-t-8 border-primary select-none outline-none"
      style={{
        fontSize: '62.5%',
        '--closeImage': 'url(https://cdn.yellowmessenger.com/files/images/close.png)',
        margin: 0,
        boxSizing: 'inherit',
        WebkitTapHighlightColor: 'transparent',
        padding: '7rem 0 2rem',
        background: '#323231'
      }}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* BK Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">BK® INFO</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link className="hover:text-white transition-colors" to="/about">About BK®</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/fresh-taste">Fresh Taste</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/investor-relations">Investor Relations</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/fssai">Fssai</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">CONTACT</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link className="hover:text-white transition-colors" to="/support">FAQ's &amp; Support</Link></li>
              <li><span className="text-white">Write to us :</span></li>
              <li><Link className="hover:text-white transition-colors ml-2" to="/careers">Careers</Link></li>
              <li><Link className="hover:text-white transition-colors ml-2" to="/customer-care">Customer Care</Link></li>
              <li><Link className="hover:text-white transition-colors ml-2" to="/supply-chain">Supply Chain Queries</Link></li>
              <li><Link className="hover:text-white transition-colors ml-2" to="/investor-relations-2">Investor Relations</Link></li>
              <li><Link className="hover:text-white transition-colors ml-2" to="/franchising">Franchising</Link></li>
            </ul>
          </div>
          {/* BK Cares */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">BK® CARES</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link className="hover:text-white transition-colors" to="/nutrition">Nutrition Information</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/brighter-futures">Creating Brighter Futures</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/trust-taste">Trust &amp; Taste</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/covid19-safety">COVID-19 Safety</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">LEGAL</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link className="hover:text-white transition-colors" to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/promo-terms">Promotional T &amp; C</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/compliance">Compliance</Link></li>
            </ul>
          </div>

        </div>
        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logo} alt="BK Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-medium text-center md:text-left">
            TM &amp; © 2026 VELVET BYTES COMPANY LLC . All Rights Reserved.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-4">
            <a className="w-8 h-8 rounded-full bg-white text-[#323231] flex items-center justify-center hover:bg-gray-200 transition-colors" href="#">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a className="w-8 h-8 rounded-full bg-white text-[#323231] flex items-center justify-center hover:bg-gray-200 transition-colors" href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a className="w-8 h-8 rounded-full bg-white text-[#323231] flex items-center justify-center hover:bg-gray-200 transition-colors" href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a className="w-8 h-8 rounded-full bg-white text-[#323231] flex items-center justify-center hover:bg-gray-200 transition-colors" href="#">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
