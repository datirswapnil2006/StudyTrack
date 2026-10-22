# StudyTrack | Personal Study Progress Tracker & Performance Analytics

A personal study management and analytics web application built with **React.js, Vite, Tailwind CSS, and Supabase PostgreSQL**, designed with a warm cream (`#FFF9F0`) and light blue visual theme.

Track daily study timetables, completed tasks, DSA practice, coding mistakes, weak topics, revision progression, and generate downloadable weekly, 15-day, and monthly PDF & CSV performance reports.

---

## 🚀 Key Features

### 1. Timetable Management (College vs No-College Day)
- **Templates Included**:
  - **College Day**: Morning DSA, college aptitude practice, evening MERN feature development, Python concepts, and DevOps containerization.
  - **No-College Day**: Extended DSA blocks, timed aptitude tests, MERN building & debugging, Python projects, DevOps hands-on, and late-night mistake revisions.
- **Midnight-Spanning Tasks**: Seamlessly tracks late-night study blocks crossing midnight (e.g., 10:00 PM – 12:00 AM) and attributes them to the study start day.
- **Customizable**: Add, edit, remove, reorder tasks, and adjust durations with live actual vs. planned tracking.
- **Health & Consistency**: Daily 6–7h sleep guidance and Sunday test reminders.

### 2. Daily Task & Question Tracking
- Track questions planned, attempted, correct, and incorrect answers with live accuracy percentages.
- Task completion checkbox with celebration confetti.
- Track mistake notes, difficult topic flags, and weekend revision tags.

### 3. Dedicated DSA Mistake Tracker
- Log problem names, LeetCode / platform URLs, topics, algorithm patterns, and difficulty.
- Classify by mistake category: *Conceptual, Logical, Implementation, Edge Case, Time Complexity*.
- Detailed explanations of what went wrong vs. correct invariant approach.
- Next revision dates and resolution status toggling.

### 4. Weak Topics & Cognitive Mastery Progression
- Register challenging topics with 1–5 star confidence ratings.
- Repeatable **Log Revision** workflow with revision logs and confidence progression over time (*Struggling → Improving → Comfortable → Mastered*).

### 5. Downloadable Executive Reports & Analytics
- **Reporting Periods**:
  - Weekly Report (Last 7 days, Asia/Kolkata timezone)
  - 15-Day Report (Last 15 days)
  - Monthly Report (Current calendar month or custom month)
  - Custom Date Range Picker
- **Executive PDF Export**: Styled with jsPDF and jsPDF-AutoTable with multi-page support, summary cards, subject breakdown tables, daily performance logs, mistake patterns, weak topic checklist, and actionable recommendations.
- **CSV Data Export**: Export detailed task logs or executive summary metrics for spreadsheet analysis.
- **Reflections & Goals**: Dedicated text areas saved directly to database records.

---

## 🛠️ Tech Stack

- **Frontend**: React.js 19 + Vite
- **Styling**: Tailwind CSS v4 (Warm cream `#FFF9F0`, light blue `#DCEBFA`, primary blue `#6B9ACF`)
- **Backend as a Service**: Supabase Auth & PostgreSQL
- **Database Security**: Row Level Security (RLS) on all user-owned tables
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Celebration**: Canvas-Confetti

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/datirswapnil2006/StudyTrack.git
cd StudyTrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Supabase Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### 4. Run database migrations
Execute the SQL script located in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
myprogressWeb/
├── public/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx
│   │   ├── MistakeModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── RevisionModal.jsx
│   │   ├── SupabaseSetupBanner.jsx
│   │   ├── TaskEditModal.jsx
│   │   └── TopicModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── services/
│   │   └── studyService.js
│   ├── utils/
│   │   ├── csvExporter.js
│   │   ├── dateUtils.js
│   │   ├── pdfGenerator.js
│   │   ├── reportCalculator.js
│   │   └── timetableDefaults.js
│   ├── views/
│   │   ├── DashboardView.jsx
│   │   ├── DifficultTopicsView.jsx
│   │   ├── MistakesView.jsx
│   │   ├── ReportsView.jsx
│   │   └── TimetableView.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── .env.example
├── package.json
└── vite.config.js
```

---

## 📄 License
MIT License. Created for high-performance daily study consistency and DSA mastery.
