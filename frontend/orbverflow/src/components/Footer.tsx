import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 pt-6 pb-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="mb-2 md:mb-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors hover:translate-y-[-2px] transform duration-200">
              About
            </div>
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors hover:translate-y-[-2px] transform duration-200">
              Careers
            </div>
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors hover:translate-y-[-2px] transform duration-200">
              Press
            </div>
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors hover:translate-y-[-2px] transform duration-200">
              Contact
            </div>
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors hover:translate-y-[-2px] transform duration-200">
              Privacy Policy
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SocialButton icon={<Github size={18} />} />
          <SocialButton icon={<Twitter size={18} />} />
          <SocialButton icon={<Linkedin size={18} />} />
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-gray-500">
        © 2023 COSMOS Space Administration. All rights reserved.
      </div>
    </footer>);

};
const SocialButton = ({ icon }) => {
  return (
    <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:scale-110 hover:rotate-6 transform">
      {icon}
    </button>);

};
export default Footer;