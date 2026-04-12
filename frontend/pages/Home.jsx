import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Smartphone, ArrowRight, Sprout, MessageCircle, Calculator, Award } from 'lucide-react';
import '../styles/home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <span className="badge">Cooperativa de Ahorro y Credito</span>
          <h1>Construyendo <span className="text-gradient">estrategias</span> para tu futuro financiero.</h1>
          <p>
            CoopEocala es una cooperativa de ahorro, credito y servicios multiples.
            Forma parte de nuestra gran familia de socios.
          </p>

          <div className="hero__buttons">
            <Link to="/register" className="btn btn--gold">
              Activar acceso web <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn--outline">
              Ya tengo acceso
            </Link>
          </div>

          <div className="hero__trust">
            <div className="trust-item">
              <ShieldCheck size={16} />
              <span>99% satisfaccion</span>
            </div>
            <div className="trust-item">
              <Users size={16} />
              <span>100% compromiso</span>
            </div>
            <div className="trust-item">
              <Award size={16} />
              <span>Registrada UAF</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="coop-card">
            <div className="coop-card__header">
              <Sprout size={20} />
              <span>CoopEocala</span>
            </div>
            <div className="coop-card__balance">
              <p>Ahorros disponibles</p>
              <h2>RD$ 128,540.00</h2>
            </div>
            <div className="coop-card__footer">
              <span>Socio desde 2021</span>
              <span>**** 4589</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="servicios">
        <div className="features__header">
          <h2>Nuestros Productos y Servicios</h2>
          <p>Todo lo que necesitas para crecer financieramente</p>
        </div>

        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__icon"><ShieldCheck size={22} /></div>
            <h3>Cuentas de Ahorro</h3>
            <p>Ahorra con seguridad y obten rendimientos competitivos para tu dinero.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--gold"><Calculator size={22} /></div>
            <h3>Prestamos</h3>
            <p>Prestamos personales y de nomina con las mejores condiciones del mercado.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--accent"><Award size={22} /></div>
            <h3>Certificados</h3>
            <p>Certificados de deposito a plazo fijo con tasas atractivas.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon"><Smartphone size={22} /></div>
            <h3>Banca Digital</h3>
            <p>Gestiona tu cuenta desde web y nuestro bot de WhatsApp 24/7.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <h2>Necesitas ayuda o quieres afiliarte?</h2>
          <p>Visitanos en nuestra sede o contactanos por WhatsApp. Estamos para servirte.</p>
          <div className="cta-info">
            <span>(809) 544-3140</span>
            <span>info@coopeocala.com</span>
          </div>
          <div className="cta-buttons">
            <a href="https://coopeocala.com/registro-de-socios" target="_blank" rel="noopener noreferrer" className="btn btn--gold">
              Registro de Socios <ArrowRight size={16} />
            </a>
            <a href="https://wa.me/18094433140?text=Saludos%2C%20me%20gustaria%20saber%20mas%20sobre..." target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Sprout size={20} />
            <span>CoopEocala</span>
          </div>
          <div className="footer-info">
            <p>Av. Gustavo Mejia Ricart No. 71, Edif. Caromang, Local 207, Piantini, Santo Domingo</p>
            <p>Lun-Vie 9:00 AM - 5:30 PM · Sab 9:00 AM - 12:30 PM</p>
          </div>
          <p className="footer-copy">© 2026 CoopEocala · Cooperativa de Ahorro y Credito</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
