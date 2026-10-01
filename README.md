# KiddoCare (React Frontend)

Frontend for KiddoCare, a pediatric clinic management system. Parents can sign up, book appointments, view documents, vaccinations and payments, send feedback, and get help. There is also an admin login and dashboard.

> **Note:** This is a frontend-only prototype. There is no backend yet, so login, signup, appointments and feedback use placeholder logic (see [Demo Notes](#demo-notes)).

## Tech Stack

- [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) (`react-router-dom`) for routing
- [lucide-react](https://lucide.dev/) for icons
- Plain CSS (`index.css`, `auth.css`, `dashboard.css`)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (LTS recommended)
- npm (comes with Node.js)
- Git

Check your versions:

```bash
node -v
npm -v
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd kiddocare-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   If `react-router-dom` or `lucide-react` are reported as missing, install them:

   ```bash
   npm install react-router-dom lucide-react
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open the app** at the URL shown in the terminal (Vite's default is <http://localhost:5173>).

## Available Scripts

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Starts the dev server with hot reload          |
| `npm run build`   | Creates a production build in `dist/`          |
| `npm run preview` | Serves the production build locally to test it |

## Project Structure

```
kiddocare-react/
├── public/
│   └── images/            # hero.png, kiddocare-logo.png, checkups.webp, etc.
├── src/
│   ├── components/        # Navbar, Footer, DashboardSidebar, NotificationButton
│   ├── context/           # AuthContext, NotificationContext
│   ├── pages/             # Home, Services, Login, Signup, Dashboard, ...
│   ├── App.jsx            # Route definitions
│   ├── main.jsx           # App entry point and providers
│   ├── index.css          # Global + landing/services styles
│   ├── auth.css           # Login / signup styles
│   └── dashboard.css      # Dashboard styles
└── package.json
```

## Routes

| Path               | Page                          |
| ------------------ | ----------------------------- |
| `/`                | Home                          |
| `/services`        | Services + appointment booking |
| `/login`           | Parent login                  |
| `/signup`          | Parent signup (3 steps)       |
| `/dashboard`       | Parent dashboard              |
| `/user-dashboard`  | User dashboard                |
| `/documents`       | Downloadable documents        |
| `/vaccinations`    | Vaccination records           |
| `/payments`        | Payments and history          |
| `/feedback`        | Submit and view feedback      |
| `/help`            | FAQs and help requests        |
| `/admin`           | Admin login                   |
| `/admin-dashboard` | Admin dashboard               |

Unknown routes redirect to `/`.

## Demo Notes

- **Parent login** (`/login`): any email and password will work. Real authentication is not implemented yet.
- **Admin login** (`/admin`): use the email `kiddocareadmin@gmail.com` with any password.
- **Signup**: the password needs at least 8 characters, including a letter, a number and a special character. The contact number must be an 11-digit PH mobile number starting with `09`.
- **Appointments**: the booking form only allows dates within the current week and currently shows an alert instead of calling an API.
- **Payments**: data is saved in your browser's `localStorage` under the key `kiddocare-payments`. To reset it, clear that key in DevTools (Application > Local Storage) or clear site data.
- **Documents, Vaccinations, Feedback, Help**: use sample or empty data for now. Several have `TODO` comments marking where backend calls should go.

## Troubleshooting

- **Images are missing or broken:** make sure the image files live in `public/images/` and are named exactly as referenced in the code (for example `/images/hero.png`).
- **`Failed to resolve import`:** run `npm install` again, then restart the dev server.
- **Port already in use:** Vite will pick the next free port, or run `npm run dev -- --port 3000`.
- **Blank page after changing something:** check the browser console and the terminal for errors, then restart `npm run dev`.

## Deployment

```bash
npm run build
```

Upload the generated `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.). Because the app uses client-side routing, configure the host to redirect all paths to `index.html`.
