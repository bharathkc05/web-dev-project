import logo from '../../assets/logo.png';

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
              <li><a className="hover:text-white transition-colors" href="#">About BK®</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Fresh Taste</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Investor Relations</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Fssai</a></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">CONTACT</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a className="hover:text-white transition-colors" href="#">FAQ's &amp; Support</a></li>
              <li><span className="text-white">Write to us :</span></li>
              <li><a className="hover:text-white transition-colors ml-2" href="#">Careers</a></li>
              <li><a className="hover:text-white transition-colors ml-2" href="#">Customer Care</a></li>
              <li><a className="hover:text-white transition-colors ml-2" href="#">Supply Chain Queries</a></li>
              <li><a className="hover:text-white transition-colors ml-2" href="#">Investor Relations</a></li>
              <li><a className="hover:text-white transition-colors ml-2" href="#">Franchising</a></li>
            </ul>
          </div>
          {/* BK Cares */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">BK® CARES</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a className="hover:text-white transition-colors" href="#">Nutrition Information</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Creating Brighter Futures</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Trust &amp; Taste</a></li>
              <li><a className="hover:text-white transition-colors" href="#">COVID-19 Safety</a></li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">LEGAL</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a className="hover:text-white transition-colors" href="#">Terms &amp; Conditions</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Promotional T &amp; C</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Compliance</a></li>
            </ul>
          </div>

        </div>
        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logo} alt="BK Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-medium text-center md:text-left">
            TM &amp; © 2026 BURGER KING COMPANY LLC . All Rights Reserved.
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
