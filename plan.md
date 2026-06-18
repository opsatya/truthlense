# Plan: AI Fake News Detection - Auth & Model Fixes

## 1. Fix the "Not Found" Bug in Model
**Issue:** When text from a trusted source (like BBC) is pasted, the system extracts the first 6 words using `preprocess()` from `preprocessor.py`. The issue is `preprocess()` applies Porter Stemming (e.g. "minister" -> "minist"), and NewsAPI does not understand stemmed words, returning 0 results.
**Fix:** Update `backend/ml/news_checker.py` to extract un-stemmed, real keywords (e.g. by stripping stop words and punctuation but omitting stemming) and increase `pageSize` for NewsAPI to improve the hit rate.

## 2. Authentication System (Backend)
- Update `backend/requirements.txt` to include `pyjwt`, `passlib`, `bcrypt`.
- Update `backend/database.py` to:
  - Create a `users` table.
  - Add a `user_id` column to the `predictions` table.
- Create `backend/auth.py` for JWT handling and password hashing.
- Update `backend/main.py`:
  - Add `/register` and `/login` routes.
  - Make `/predict` and `/analyze-url` endpoints accept an optional Authorization token.
  - If token is present, validate it and save the history to the database tied to `user_id`.
  - If token is NOT present, do NOT save history to the database.
  - Modify `/dashboard` to only return the history/stats for the logged-in user.

## 3. Authentication System (Frontend)
- **Pages/Components:**
  - Create `LoginPage.js` and `RegisterPage.js`.
  - Add AuthContext (`AuthContext.js`) to manage user session.
  - Update `Navbar.js` to show Login/Register/Logout links.
- **Functionality:**
  - Update `AnalyzePage.js` and `UrlAnalyzePage.js` to send the token if the user is logged in.
  - The public can still use the Analyze tools (history won't be saved on the backend).
  - Update `DashboardPage.js` to:
    - Protect the route (or show a message to login to view history).
    - If logged in, fetch the user's personal analytics.
    - Improve the dashboard UI to show better graphs (e.g., using a charting library like Recharts or simple CSS-based graphs) and personal history.

## 4. README Update
- Update `README.md` to reflect the new authentication features, the optional login functionality for storing history, and the improvements made to the NewsAPI keyword extraction for better accuracy.
