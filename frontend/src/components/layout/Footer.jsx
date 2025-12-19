import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-zinc-900/20 border-t border-white/5 mt-auto backdrop-blur-xl">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-light text-white tracking-[0.2em]">
                <span className="text-[#F4C430]">VALENTIQUE</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Curating the world's finest luxury bags since 2024. 
              Where elegance meets exclusivity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] text-[#F4C430]/90 uppercase font-medium mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] text-[#F4C430]/90 uppercase font-medium mb-4">
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] tracking-[0.3em] text-[#F4C430]/90 uppercase font-medium mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>support@valentique.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>+91 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>123 Park Street<br />Kolkata, West Bengal 700001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500 font-light tracking-wide">
            © {new Date().getFullYear()} Valentique. All rights reserved. 
          </p>
          <p className='text-xs text-zinc-500 font-light tracking-wide'>Developed with ❤️ by Yash Shaw.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;