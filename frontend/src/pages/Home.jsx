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
  Globe,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ ADD
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ ADD
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  /* ✅ ROLE-AWARE NAVIGATION */
  const goToDashboard = () => {
    if (!user) return navigate('/login');

    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'reviewer':
        navigate('/reviewer');
        break;
      default:
        navigate('/author');
    }
  };

  const features = [
    {
      icon: <FileText size={40} />,
      title: 'Paper Submission',
      description: 'Easy-to-use interface for authors to submit research papers.',
      color: 'var(--primary)'
    },
    {
      icon: <Users size={40} />,
      title: 'Reviewer Management',
      description: 'Assign papers and track review progress efficiently.',
      color: 'var(--secondary)'
    },
    {
      icon: <Shield size={40} />,
      title: 'Admin Dashboard',
      description: 'Manage submissions, users, and conference settings.',
      color: 'var(--accent)'
    },
    {
      icon: <BarChart size={40} />,
      title: 'Real-time Tracking',
      description: 'Monitor submissions, reviews, and statistics.',
      color: 'var(--success)'
    },
    {
      icon: <Calendar size={40} />,
      title: 'Conference Scheduling',
      description: 'Plan sessions and generate conference programs.',
      color: 'var(--warning)'
    },
    {
      icon: <CheckCircle size={40} />,
      title: 'Decision Management',
      description: 'Streamline accept/reject decisions.',
      color: 'var(--info)'
    },
    {
      icon: <Globe size={40} />,
      title: 'Global Accessibility',
      description: 'Access the platform from anywhere in the world.',
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
            {!user ? (
              <>
                <button className="btn btn-outline" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>
                  Register
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={goToDashboard}>
                Go to Dashboard
              </button>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Manage Conferences <span className="highlight">Efficiently</span>
            </h1>

            <p>
              A complete platform for authors, reviewers, and organizers.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={goToDashboard}>
                {user ? 'Go to Dashboard' : 'Submit a Paper'}
                <ChevronRight size={20} />
              </button>

              {!user && (
                <button className="btn btn-outline" onClick={() => navigate('/register')}>
                  Create Account
                </button>
              )}
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

      {/* WHO IS THIS FOR */}
      <section id="about">
        <h2>Who is this platform for?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FileText size={32} />
            <h3>Authors</h3>
            <p>Submit papers, track status, and receive decisions.</p>
          </div>
          <div className="feature-card">
            <Users size={32} />
            <h3>Reviewers</h3>
            <p>Review assigned papers and manage deadlines.</p>
          </div>
          <div className="feature-card">
            <Shield size={32} />
            <h3>Admins</h3>
            <p>Manage users, reviews, and conference workflow.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <h2>Features</h2>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div style={{ color: feature.color }}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <p>© {new Date().getFullYear()} Conference Management System</p>
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
