import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X,
  Users,
  FileText,
  Shield,
  BarChart,
  Calendar,
  CheckCircle,
  Send,
  Download,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';

import './Home.css';

const Home = () => {

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // ✅ FIXED features array
  const features = [
    {
      icon: <FileText size={40} />,
      title: 'Paper Submission',
      description: 'Easy-to-use interface for authors to submit research papers with automated formatting checks.',
      color: 'var(--primary)'
    },
    {
      icon: <Users size={40} />,
      title: 'Reviewer Management',
      description: 'Efficiently assign papers to reviewers based on expertise and track review progress.',
      color: 'var(--secondary)'
    },
    {
      icon: <Shield size={40} />,
      title: 'Admin Dashboard',
      description: 'Comprehensive admin panel to manage submissions, users, and conference settings.',
      color: 'var(--accent)'
    },
    {
      icon: <BarChart size={40} />,
      title: 'Real-time Tracking',
      description: 'Monitor submission status, review progress, and conference statistics in real-time.',
      color: 'var(--success)'
    },
    {
      icon: <Calendar size={40} />,
      title: 'Conference Scheduling',
      description: 'Plan and organize conference schedules, sessions, and speaker arrangements.',
      color: 'var(--warning)'
    },
    {
      icon: <CheckCircle size={40} />,
      title: 'Decision Management',
      description: 'Streamline acceptance/rejection decisions with automated notifications.',
      color: 'var(--info)'
    },
    {
      icon: <Globe size={40} />, // ✅ FIXED HERE
      title: 'Global Accessibility',
      description: 'Access and manage conferences from anywhere in the world.',
      color: '#6366f1'
    }
  ];

  const stats = [
    { value: '500+', label: 'Conferences Managed' },
    { value: '10K+', label: 'Papers Submitted' },
    { value: '2K+', label: 'Reviewers' },
    { value: '50+', label: 'Countries' }
  ];

  return (

    <div className="home">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="nav-container">

          <div className="logo">
            <Calendar size={28} />
            <span>Conference Management System</span>
          </div>

          <div className="nav-menu">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-auth">

            <button
              className="btn btn-outline"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              Register
            </button>

          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>

        </div>

        {isMenuOpen && (

          <div className="mobile-menu">

            <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>

            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>

            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>

            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>

            <button onClick={() => navigate('/login')}>
              Login
            </button>

            <button onClick={() => navigate('/register')}>
              Register
            </button>

          </div>

        )}

      </nav>


      {/* HERO */}

      <section id="home" className="hero">

        <div className="hero-container">

          <div className="hero-content">

            <h1>
              Manage Conferences <span className="highlight">Efficiently</span>
            </h1>

            <p>
              Submit papers, review submissions, and manage conferences seamlessly.
            </p>

            <div className="hero-buttons">

              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Get Started
                <ChevronRight size={20} />
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/register')}
              >
                Register
              </button>

            </div>

            <div className="hero-stats">

              {stats.map((stat, i) => (

                <div key={i}>

                  <h3>{stat.value}</h3>

                  <p>{stat.label}</p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}

      <section id="features">

        <h2>Features</h2>

        <div className="features-grid">

          {features.map((feature, i) => (

            <div key={i} className="feature-card">

              <div style={{ color: feature.color }}>
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

            </div>

          ))}

        </div>

      </section>


      {/* ABOUT */}

      <section id="about">

        <h2>About Platform</h2>

        <p>
          Comprehensive platform for managing conferences efficiently.
        </p>

      </section>


      {/* FOOTER */}

      <footer id="contact">

        <p>
          © {new Date().getFullYear()} Conference Management System
        </p>

        <div>

          <Mail size={16} /> support@cms.com

          <Phone size={16} /> +91 9999999999

          <MapPin size={16} /> India

        </div>

      </footer>

    </div>

  );

};

export default Home;