import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-col">
        <h4>Contact Us</h4>
        <p><svg className="ico" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z" fill="#fff" /></svg> Manila, Philippines</p>
        <p><svg className="ico" viewBox="0 0 24 24"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 006 6L17 13l5 2v4a2 2 0 01-2 2C10.6 21 3 13.4 3 4a2 2 0 012-2z" fill="#fff" /></svg> 0912 345 6789</p>
        <p><svg className="ico" viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="none" stroke="#fff" strokeWidth="1.5" /><path d="M3 5l9 8 9-8" fill="none" stroke="#fff" strokeWidth="1.5" /></svg> kiddocare02@gmail.com</p>
      </div>
      <div className="footer-col footer-logo">
        <img src="/images/kiddocare-logo.png" alt="KiddoCare" className="footer-logo-img" />
      </div>
      <div className="footer-col">
        <h4>Navigation</h4>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/#about">About Us</Link>
      </div>
      <div className="footer-bottom">
        <span>&copy; KiddoCare. All rights reserved</span>
        <div className="socials">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="none" stroke="#fff" strokeWidth="1.4" /><path d="M14 8h-1.5c-.6 0-1 .4-1 1v2H14l-.4 2.5h-1.6V19h-2.5v-5.5H8V11h1.5V9c0-1.7 1-3 2.8-3H14z" fill="#fff" /></svg>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="none" stroke="#fff" strokeWidth="1.4" /><path d="M18 8.3c-.4.2-.9.3-1.4.4a2.4 2.4 0 001-1.3c-.5.3-1 .5-1.6.6a2.4 2.4 0 00-4.1 2.2 6.8 6.8 0 01-5-2.5 2.4 2.4 0 00.8 3.2c-.4 0-.8-.1-1.1-.3v.1c0 1.2.8 2.1 1.9 2.4-.3.1-.7.1-1.1 0 .3 1 1.2 1.6 2.3 1.7A4.8 4.8 0 016 15.7 6.8 6.8 0 009.6 16.7c4.3 0 6.7-3.6 6.7-6.7v-.3c.5-.3.9-.7 1.2-1.2z" fill="#fff" /></svg>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="none" stroke="#fff" strokeWidth="1.4" /><path d="M6 8h12v8H6z" fill="none" stroke="#fff" strokeWidth="1.3" /><path d="M6 8l6 5 6-5" fill="none" stroke="#fff" strokeWidth="1.3" /></svg>
        </div>
      </div>
    </footer>
  )
}
