import React, { useEffect } from 'react';
import './InfoPage.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';

const InfoPage = () => {
  useEffect(() => {
    Aos.init({ duration: 1000 });
    feather.replace();

    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const toTop = document.querySelector('.to-top');

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (toTop) {
        if (scrollTop > 300) {
          toTop.classList.add('active');
        } else {
          toTop.classList.remove('active');
        }
      }

      if (header) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }
      }

      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="info-page">
      <header data-aos="fade-down">
        <div className="container">
          <div className="content">
            <div className="logo" data-aos="fade-right">
              <img src="/images/ff.png" alt="Fridge Fusion Logo" />
              <a href="#">Fridge Fusion</a>
            </div>
            <nav data-aos="fade-left">
              <a href="#features" onClick={handleSmoothScroll}>Features</a>
              <a href="#how-it-works" onClick={handleSmoothScroll}>How It Works</a>
              <a href="#ai-section" onClick={handleSmoothScroll}>AI Assistant</a>
              <a href="#testimonials" onClick={handleSmoothScroll}>Testimonials</a>
              <a href="#cta" onClick={handleSmoothScroll}>Get Started</a>
            </nav>
          </div>
        </div>
      </header>

      <a href="#" className="to-top" onClick={handleSmoothScroll}>
        <i data-feather="chevron-up"></i>
      </a>

      <section className="hero">
        <div className="container">
          <div className="content">
            <div className="text" data-aos="fade-up">
              <h1>Smart Cooking Starts Here</h1>
              <p>
                Create, manage, and discover <span>recipes</span> with Fridge Fusion’s AI-powered assistant—your key to a <span>waste-free kitchen</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <h2>KEY FEATURES</h2>
            <h1>Your Kitchen, Reimagined</h1>
            <p>Fridge Fusion brings recipe creation, management, and AI assistance together in one seamless experience.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <div className="card-image">
                <img src="/images/recp managerr.jpg" alt="Recipe Generator" />
              </div>
              <div className="card-content">
                <h3>Recipe Generator</h3>
                <p>Create custom recipes with ingredients, instructions, and images—saved instantly to your collection.</p>
              </div>
            </div>
            <div className="feature-card" data-aos="fade-up" data-aos-delay="400">
              <div className="card-image">
                <img src="/images/recp manager.jpg" alt="Recipe Manager" />
              </div>
              <div className="card-content">
                <h3>Recipe Manager</h3>
                <p>Browse, sort, and favorite your recipes with an interactive card system designed for ease.</p>
              </div>
            </div>
            <div className="feature-card" data-aos="fade-up" data-aos-delay="600">
              <div className="card-image">
                <img src="/images/ggg.png" alt="AI Assistant" />
              </div>
              <div className="card-content">
                <h3>AI Assistant</h3>
                <p>Get recipe ideas and cooking tips tailored to your ingredients and preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <h2>HOW IT WORKS</h2>
            <h1>From Fridge to Feast</h1>
            <p>Three simple steps to unlock your kitchen’s potential.</p>
          </div>
          <div className="steps">
            <div className="step" data-aos="fade-up">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Recipes</h3>
                <p>Input your ingredients and details to build personalized recipes, saved for future use.</p>
              </div>
            </div>
            <div className="step" data-aos="fade-up" data-aos-delay="200">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Manage & Explore</h3>
                <p>Organize your collection, favorite top picks, and browse with ease.</p>
              </div>
            </div>
            <div className="step" data-aos="fade-up" data-aos-delay="400">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Ask the AI</h3>
                <p>Get instant recipe suggestions and cooking advice from our smart assistant.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-section" id="ai-section">
        <div className="container">
          <div className="content">
            <div className="text" data-aos="fade-right">
              <div className="section-title">
                <h2>AI ASSISTANT</h2>
                <h1>Meet Your Kitchen Helper</h1>
                <p>Our AI analyzes your ingredients and suggests recipes, making cooking effortless and creative.</p>
              </div>
            </div>
            <div className="response-window" data-aos="fade-left">
              <p>“Try a creamy mushroom pasta with your leftover cream and mushrooms!”</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <h2>TESTIMONIALS</h2>
            <h1>What Cooks Are Saying</h1>
            <p>Hear from users who’ve transformed their kitchens with Fridge Fusion.</p>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
              <div className="quote">“The recipe generator saved me from throwing out veggies—now I’ve got a killer soup recipe!”</div>
              <div className="author">
                <img src="https://randomuser.me/api/portraits/women/43.jpg" alt="Sarah J." />
                <div className="author-info">
                  <h4>Sarah J.</h4>
                  <p>Home Cook</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="400">
              <div className="quote">“Managing my recipes is so easy now—I love the flip cards and favorites feature.”</div>
              <div className="author">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael T." />
                <div className="author-info">
                  <h4>Michael T.</h4>
                  <p>Food Enthusiast</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="600">
              <div className="quote">“The AI gave me a dessert idea I’d never have thought of—genius!”</div>
              <div className="author">
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Amina K." />
                <div className="author-info">
                  <h4>Amina K.</h4>
                  <p>Busy Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="container">
          <div className="content" data-aos="fade-up">
            <h1>Ready to Cook Smarter?</h1>
            <p>Join a community of home cooks creating, managing, and discovering recipes with Fridge Fusion.</p>
            <a href="/login" className="cta-button">
              Let's Start <i data-feather="arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-col">
            <h3>Fridge Fusion</h3>
            <p>Your all-in-one tool for recipe creation, management, and AI-powered cooking inspiration.</p>
          </div>
          <div className="footer-col">
            <h3>Features</h3>
            <ul>
              <li><a href="#">Recipe Generator</a></li>
              <li><a href="#">Recipe Manager</a></li>
              <li><a href="#ai-section" onClick={handleSmoothScroll}>AI Assistant</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Connect</h3>
            <div className="social-links">
              <a href="#"><i data-feather="facebook"></i></a>
              <a href="#"><i data-feather="instagram"></i></a>
              <a href="#"><i data-feather="twitter"></i></a>
            </div>
          </div>
        </div>
        <div className="copyright">
          <p>© 2025 Fridge Fusion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InfoPage;
