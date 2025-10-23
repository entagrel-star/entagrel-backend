import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isBlogPage = location.pathname === '/blog';
  const isContactPage = location.pathname ==='/contact-us';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated: Contact now links to /contact-us
  const homeNavLinks = [
    { href: '#services', label: 'Services', isRoute: false },
    { href: '#process', label: 'Process', isRoute: false },
    { href: '/blog', label: 'Blog', isRoute: true },
    { href: '/contact-us', label: 'Contact', isRoute: true }, // ✅ Updated
    { href: '/seo', label: 'SEO', isRoute: true }, // Added SEO link
  ];

  const blogNavLinks = [
    { href: '/', label: 'Home', isRoute: true },
    { href: '/blog', label: 'Blog', isRoute: true },
  ];

  const ContactNavLink = [
    { href: '/', label: 'Home', isRoute: true },
    { href: '/contact-us', label: 'Contact Us', isRoute: true },
    
  ]

  let navLinks;
  if(isBlogPage){
    navLinks = blogNavLinks
  }else if(isContactPage){
    navLinks = ContactNavLink
  } else{
    navLinks = homeNavLinks
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-2xl font-bold text-foreground cursor-pointer">
            Entagrel <span className="text-primary">Marketing</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-foreground text-2xl"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleLinkClick}
                className="block text-center py-3 px-6 text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="block text-center py-3 px-6 text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
