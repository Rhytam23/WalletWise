<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
<h3 align="center">WalletWise</h3>

  <p align="center">
    A personal finance app for students and young professionals that does more than record what you spent.
    <br />
    <a href="https://github.com/Rhytam23/WalletWise"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Rhytam23/WalletWise/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/Rhytam23/WalletWise/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

A personal finance app for students and young professionals that does more than record what
you spent. It sorts transactions into categories, holds you to a monthly budget, plans for bills
and savings goals that are coming up, and explains your spending patterns, including how your
mood relates to what you buy. A decision helper tells you whether a purchase is affordable
before you make it.

> **Status:** actively developed. Transactions, budgets, savings goals, subscriptions, shared
> wallets, reports, gamification and the privacy vault are working. Spending insights, the
> investment simulator and the decision helper are in the app but still being refined. See
> [Features](#features) for what each one does today.

### Features


- **Transactions**: income and expenses with category, payment method and mood. Recurring
  transactions run from a background worker and can be skipped one occurrence at a time.
  Duplicates within 24 hours are flagged before they are saved. Deleted transactions can be
  undone for 10 minutes; undo restores the exact original, into the wallet it came from.
- **Budgets**: a monthly budget split across categories, with live planned-versus-actual
  progress and alerts at 80% and when a limit is crossed.
- **Savings goals**: target amount and date, with the daily and weekly saving needed and an
  on-track or lagging status. Money added to a goal leaves your wallet balance.
- **Subscriptions**: detects repeating charges and emails a reminder before they are due. You
  choose how many days ahead (1, 3 or 7) or turn reminders off.
- **Shared wallets**: a wallet with several members and its own balance and transactions. Only
  members can read it.
- **Insights**: behaviour and mood-based spending analysis, spending forecasts, a decision
  helper and an investment simulator that uses spare budget as virtual money.
- **Reports**: spending by category and period.
- **Gamification**: XP, streaks, badges and levels for keeping up the habit.
- **Privacy vault**: client-side encryption for transaction notes, with a passphrase that never
  leaves the browser.
- **Accounts**: email and password with OTP email verification and password reset, optional
  Google sign-in, JWT access and refresh cookies, light and dark themes, multiple currencies.

### Stack


| Part | Technology |
| :--- | :--- |
| Frontend | React (Create React App), Tailwind CSS, Chart.js, framer-motion |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (access and refresh), Passport Google OAuth 2.0, bcrypt |
| Validation | zod |
| Uploads | multer, Cloudinary (avatars) |
| Tests | Jest, Supertest, mongodb-memory-server |
| Hosting | Frontend on Netlify or Vercel, backend on Render |

### Security


- **Accounts:** passwords are hashed with bcrypt and need 8+ characters with upper and lower
  case, a number and a special character. Access and refresh tokens live in `httpOnly` cookies
  (`secure` in production); the refresh token is stored only as a hash. In production the server
  will not sign tokens unless `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set.
- **Sessions:** each request checks the user still exists, so a token for a deleted account
  stops working.
- **Google sign-in:** every attempt carries a random `state` tied to the browser. If the email
  already has an unverified local account, linking Google wipes that account's local password,
  so nobody can pre-register someone else's email and keep access.
- **Access control:** users reach only their own data. Shared wallets are readable by members
  only, and ids from URLs are validated before they reach a query.
- **Input:** zod validation on the main routes, whitelisted fields on updates, and search text
  escaped before it becomes a regular expression.
- **Money:** balances change with atomic updates, savings-goal contributions are one database
  update, and undo restores a snapshot the server took at delete time rather than trusting the
  request body.
- **Abuse and browser:** global, per-IP and stricter auth rate limits; Helmet with a Content
  Security Policy; CORS limited to the configured frontend; JSON-only bodies (avatar upload
  excepted); size- and type-limited uploads.
- **Privacy vault:** optional client-side encryption of transaction notes (AES-GCM 256, key from
  PBKDF2-SHA256 with 100,000 iterations, derived in the browser).

Known limits: writes that touch two documents (a transaction and a balance) use atomic updates
with a manual rollback, not a MongoDB multi-document transaction, so a crash between them can
leave them out of step. Logging is plain `console` output.

**Reporting a problem:** please don't open a public issue for a vulnerability. Use the
repository's Security tab ("Report a vulnerability") or message
[@Rhytam23](https://github.com/Rhytam23), with steps to reproduce.

**If you deploy it:** generate your own JWT secrets, keep `.env` out of git, and create your own
Google OAuth credentials (rotate any that were ever committed).

### Project structure


```text
WalletWise/
├── backend/
│   ├── server.js          # app setup: security, rate limits, routes
│   ├── worker.js          # recurring transactions and bill reminders (cron)
│   ├── routes/            # /api/v1/* route definitions
│   ├── controllers/       # request handlers
│   ├── services/          # business logic behind the newer controllers
│   ├── models/            # Mongoose schemas
│   ├── middleware/        # auth, validation, rate limiting, uploads
│   ├── interfaces/, container.js   # dependency injection
│   ├── utils/, constants/, config/
│   ├── scripts/           # manual security and migration scripts
│   └── tests/             # Jest suites
├── frontend/
│   ├── public/
│   └── src/               # pages/, components/, context/, hooks/, api/, utils/
├── .github/workflows/     # CI, PR and issue automation
├── CONTRIBUTING.md
└── LICENSE
```

### Deployment


- **Backend:** any Node host (set up for Render). Start with `npm start`, set `NODE_ENV=production`,
  `FRONTEND_URL` and the variables in [Configuration](#configuration).
- **Frontend:** `netlify.toml` builds `frontend/` as a single-page app. Set `REACT_APP_API_URL`
  at build time.
- **Database:** MongoDB Atlas or any MongoDB; set `MONGODB_URI`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
* [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
* [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
* [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Quick start


You need Node.js 18 or newer and a MongoDB instance (local or Atlas).

```bash
git clone https://github.com/Rhytam23/WalletWise.git
cd WalletWise

# backend, http://localhost:5000
cd backend
npm install
cp .env.example .env     # fill in MONGODB_URI and the JWT secrets
npm run dev

# frontend, http://localhost:3000 (second terminal)
cd frontend
npm install
npm start
```

The frontend talks to the backend at `REACT_APP_API_URL`. Put
`REACT_APP_API_URL=http://localhost:5000` in `frontend/.env` for local work; without it the
app calls the hosted backend.

Checks:

```bash
cd backend && npm test        # 71 tests, in-memory MongoDB, no setup needed
cd frontend && npm run build  # production build
```

`npm test` in the frontend has one known failing test (`src/api/client.test.js`, the refresh
retry case).

### Configuration


Copy `backend/.env.example` to `backend/.env`. The variables that matter:

| Variable | Needed | Notes |
| :--- | :--- | :--- |
| `MONGODB_URI` | yes in production | local or Atlas connection string; in development it defaults to `mongodb://localhost:27017/walletwise` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | yes in production | the server refuses to sign tokens without them in production; in development a random per-process secret is used |
| `FRONTEND_URL` | yes in production | used for CORS and the OAuth redirect |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | no | Google sign-in is skipped when unset |
| `SMTP_*`, or `BREVO_API_KEY` and `SENDER_EMAIL` | no | verification OTPs, password reset and bill reminder emails |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | no | Cloudinary, for avatar uploads |
| `STRICT_WALLET_BALANCE=true` | no | reject any operation that would make a balance negative |

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

### API


Routes live under `/api/v1` (also reachable as `/api`). `GET /api/health` is open and `GET /`
lists the endpoints; everything else needs a login. Google sign-in is at `/auth/google`.

`auth` · `transactions` (including `POST /:id/undo` and `PATCH /recurring/:id/skip`) · `budget` ·
`savings-goals` · `subscriptions` · `wallets` · `dashboard` · `analytics` · `insights` ·
`investments` · `gamification` · `vault`

### Testing and CI


```bash
cd backend && npm test    # 71 tests, in-memory MongoDB replica set
```

The tests cover auth, transactions, currency conversion, savings goals, the background worker,
dependency injection, and a security suite (password policy, deleted-user tokens, wallet access,
undo, savings-goal races). GitHub Actions in `.github/workflows` run checks on pull requests.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap


Not built yet: budget rollover, custom categories, multi-currency with stored exchange rates,
CSV import and export, daily and weekly spending limits, structured logging, a mobile app.

See the [open issues](https://github.com/Rhytam23/WalletWise/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing


See [CONTRIBUTING.md](CONTRIBUTING.md). Branch from `main`, keep changes focused, run
`npm test` in `backend/` and `npm run build` in `frontend/`, then open a pull request that says
what changed and why.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License


[MIT](LICENSE). Maintained by [Rhytam23](https://github.com/Rhytam23).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Rhytam Biswas - [@Rhytam23](https://github.com/Rhytam23)

Project Link: [https://github.com/Rhytam23/WalletWise](https://github.com/Rhytam23/WalletWise)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/Rhytam23/WalletWise.svg?style=for-the-badge
[contributors-url]: https://github.com/Rhytam23/WalletWise/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Rhytam23/WalletWise.svg?style=for-the-badge
[forks-url]: https://github.com/Rhytam23/WalletWise/network/members
[stars-shield]: https://img.shields.io/github/stars/Rhytam23/WalletWise.svg?style=for-the-badge
[stars-url]: https://github.com/Rhytam23/WalletWise/stargazers
[issues-shield]: https://img.shields.io/github/issues/Rhytam23/WalletWise.svg?style=for-the-badge
[issues-url]: https://github.com/Rhytam23/WalletWise/issues
[license-shield]: https://img.shields.io/github/license/Rhytam23/WalletWise.svg?style=for-the-badge
[license-url]: https://github.com/Rhytam23/WalletWise/blob/main/LICENSE
