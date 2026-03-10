import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="navbar__brand" to="/dashboard">
          Banca Digital
        </NavLink>

        <nav className="navbar__nav">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
