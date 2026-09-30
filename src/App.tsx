import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { Screen } from './app/Screen'
import { Gallery } from './gallery/Gallery'
import { Profile, Search, Settings } from './screens/Account'
import { Calendar, DayAgenda } from './screens/Calendar'
import { HobbyDetail, HobbyLibrary, HobbyProgress } from './screens/Hobbies'
import { SignIn, SignUp } from './screens/onboarding/Auth'
import { ChooseHobbies, FindTime, SetPace, StarterPlan } from './screens/onboarding/Onboarding'
import { Welcome } from './screens/onboarding/Welcome'
import { CreateActivity, PlanWithAI, ReviewPlan } from './screens/Planner'
import { Progress, Rewards, Trophies } from './screens/ProgressScreens'
import { EditSession, NiceWork, Practice } from './screens/Session'
import { Today } from './screens/Today'

function DesignSystem() {
  return (
    <Screen title="Design system" subtitle="Material 3 · Daymark Blue" back="/profile" bodyClassName="dm-system">
      <Gallery />
    </Screen>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppShell />}>
          {/* Account & onboarding */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/onboarding/hobbies" element={<ChooseHobbies />} />
          <Route path="/onboarding/pace" element={<SetPace />} />
          <Route path="/onboarding/time" element={<FindTime />} />
          <Route path="/onboarding/plan" element={<StarterPlan />} />

          {/* Tabs */}
          <Route path="/" element={<Today />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/hobbies" element={<HobbyLibrary />} />
          <Route path="/progress" element={<Progress />} />

          {/* Detail flows */}
          <Route path="/calendar/:date" element={<DayAgenda />} />
          <Route path="/hobbies/:id" element={<HobbyDetail />} />
          <Route path="/hobbies/:id/progress" element={<HobbyProgress />} />
          <Route path="/create" element={<CreateActivity />} />
          <Route path="/plan" element={<PlanWithAI />} />
          <Route path="/plan/review" element={<ReviewPlan />} />
          <Route path="/sessions/:id" element={<EditSession />} />
          <Route path="/sessions/:id/practice" element={<Practice />} />
          <Route path="/sessions/:id/done" element={<NiceWork />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/rewards/trophies" element={<Trophies />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
          <Route path="/system" element={<DesignSystem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
