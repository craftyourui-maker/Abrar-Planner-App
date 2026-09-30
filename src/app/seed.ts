import type { AppState, Hobby, Session, Task, Trophy } from './types'

export const xpFor = (minutes: number) => Math.round((minutes * 1.5 + 10) / 10) * 10

let n = 0
const tid = () => `t${++n}`
const tasks = (list: Array<[string, string, number, boolean?]>): Task[] =>
  list.map(([title, detail, minutes, done = false]) => ({ id: tid(), title, detail, minutes, done }))

/** Every hobby Daymark knows about; `active` marks the ones Alex follows. */
export const hobbyCatalog: Hobby[] = [
  {
    id: 'guitar',
    name: 'Guitar',
    icon: 'music_note',
    category: 'Music · Skill building',
    active: true,
    level: 'Intermediate',
    streak: 12,
    bestStreak: 14,
    hoursThisMonth: 7.5,
    sessionsThisMonth: 8,
    consistency: 0.92,
    statLine: '12 day streak · 8 sessions this month',
    goal: {
      title: 'Play ‘Blackbird’ end to end',
      target: '2026-11-15',
      milestones: 5,
      progress: 0.68,
      horizonWeeks: 8,
      summary: 'Learn one complete fingerstyle song',
    },
  },
  {
    id: 'running',
    name: 'Running',
    icon: 'directions_run',
    category: 'Fitness · Endurance',
    active: true,
    level: 'Beginner',
    streak: 3,
    bestStreak: 9,
    hoursThisMonth: 1.5,
    sessionsThisMonth: 3,
    consistency: 0.76,
    statLine: '3 runs · 12.4 km this month',
    goal: {
      title: 'Comfortably run 5 km',
      target: '2026-12-13',
      milestones: 4,
      progress: 0.4,
      horizonWeeks: 10,
      summary: 'Comfortably run 5 km',
    },
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'palette',
    category: 'Creative · Mindfulness',
    active: true,
    level: 'Beginner',
    streak: 2,
    bestStreak: 6,
    hoursThisMonth: 3,
    sessionsThisMonth: 3,
    consistency: 0.58,
    statLine: '2 studies · 1 project in progress',
    goal: {
      title: 'Finish a small landscape series',
      target: '2026-12-01',
      milestones: 3,
      progress: 0.33,
      horizonWeeks: 8,
      summary: 'Paint three small landscapes',
    },
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: 'menu_book',
    category: 'Learning · Calm',
    active: true,
    level: 'Advanced',
    streak: 18,
    bestStreak: 18,
    hoursThisMonth: 4,
    sessionsThisMonth: 14,
    consistency: 0.88,
    statLine: '126 pages · 2 books active',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    icon: 'skillet',
    category: 'Craft · Everyday',
    active: true,
    level: 'Intermediate',
    streak: 1,
    bestStreak: 5,
    hoursThisMonth: 2.5,
    sessionsThisMonth: 4,
    consistency: 0.64,
    statLine: '4 recipes · 3 skills practiced',
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: 'photo_camera',
    category: 'Creative · Outdoors',
    active: false,
    level: 'Beginner',
    streak: 0,
    bestStreak: 4,
    hoursThisMonth: 0,
    sessionsThisMonth: 0,
    consistency: 0,
    statLine: 'Paused since August',
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: 'self_improvement',
    category: 'Fitness · Mindfulness',
    active: false,
    level: 'Beginner',
    streak: 0,
    bestStreak: 7,
    hoursThisMonth: 0,
    sessionsThisMonth: 0,
    consistency: 0,
    statLine: 'Paused since July',
  },
  {
    id: 'gardening',
    name: 'Gardening',
    icon: 'potted_plant',
    category: 'Outdoors · Calm',
    active: false,
    level: 'Beginner',
    streak: 0,
    bestStreak: 0,
    hoursThisMonth: 0,
    sessionsThisMonth: 0,
    consistency: 0,
    statLine: 'Not started yet',
  },
]

/** Hobbies Alex has paused but still owns (shown under "Paused"). */
export const pausedHobbyIds = ['photography', 'yoga']

function session(s: Omit<Session, 'xp' | 'reminder' | 'status'> & Partial<Pick<Session, 'status' | 'reminder'>>): Session {
  return { status: 'planned', reminder: 30, xp: xpFor(s.minutes), ...s }
}

export const guitarTasks = () =>
  tasks([
    ['Warm up finger independence', 'Slow 1-2-3-4 pattern · 60 BPM', 7],
    ['Isolate chord transitions', 'G → Am → C shapes · loop 8 times', 12],
    ['Practice bars 1–8', 'Metronome at 70% target tempo', 18],
    ['Full relaxed play-through', 'No stopping · note rough spots', 8],
  ])

function seedSessions(): Session[] {
  return [
    session({
      id: 's-read-1006',
      hobbyId: 'reading',
      title: 'Morning reading',
      date: '2026-10-06',
      time: '07:15',
      minutes: 20,
      place: 'Kitchen nook',
      status: 'done',
      completedAt: '07:42',
      focusNote: '20 pages',
      tasks: tasks([['Read two chapters', 'The Overstory · ch. 9–10', 20, true]]),
    }),
    session({
      id: 's-guitar-1006',
      hobbyId: 'guitar',
      title: 'Fingerstyle foundations',
      date: '2026-10-06',
      time: '18:30',
      minutes: 45,
      place: 'Living room',
      energy: 'medium',
      tasks: guitarTasks(),
    }),
    session({
      id: 's-cook-1006',
      hobbyId: 'cooking',
      title: 'Weeknight ramen',
      date: '2026-10-06',
      time: '19:30',
      minutes: 40,
      place: 'Kitchen',
      focusNote: 'Prep ready',
      tasks: tasks([
        ['Prep aromatics', 'Garlic, ginger, scallions', 10],
        ['Make the tare', 'Soy, mirin, sesame', 8],
        ['Cook noodles and assemble', 'Soft egg · 6½ min', 16],
        ['Taste and take notes', 'What to change next time', 6],
      ]),
    }),
    session({
      id: 's-run-1008',
      hobbyId: 'running',
      title: 'Easy run + strides',
      date: '2026-10-08',
      time: '07:00',
      minutes: 30,
      place: 'River path',
      tasks: tasks([
        ['Warm-up walk', 'Brisk pace', 5],
        ['Easy run', 'Conversational effort', 20],
        ['Four strides', '20 seconds each, walk back', 5],
      ]),
    }),
    session({
      id: 's-guitar-1008',
      hobbyId: 'guitar',
      title: 'Chord transitions',
      date: '2026-10-08',
      time: '18:30',
      minutes: 30,
      place: 'Living room',
      tasks: tasks([
        ['Warm up', 'Chromatic crawl · 60 BPM', 5],
        ['G → Am → C loop', '8 clean loops in a row', 15],
        ['Apply to bars 1–8', 'Slow and steady', 10],
      ]),
    }),
    session({
      id: 's-paint-1010',
      hobbyId: 'painting',
      title: 'Color mixing study',
      date: '2026-10-10',
      time: '10:00',
      minutes: 45,
      place: 'Studio corner',
      tasks: tasks([
        ['Mix a value scale', 'Nine steps, one hue', 15],
        ['Complementary grays', 'Blue + orange', 15],
        ['Small sky study', '10 × 15 cm', 15],
      ]),
    }),
    session({
      id: 's-guitar-1010',
      hobbyId: 'guitar',
      title: 'Full-song rehearsal',
      date: '2026-10-10',
      time: '11:00',
      minutes: 45,
      place: 'Living room',
      tasks: tasks([
        ['Warm up', 'Finger independence', 7],
        ['Section run-throughs', 'Verses, then bridge', 23],
        ['Two full takes', 'Record the second one', 15],
      ]),
    }),
    session({
      id: 's-read-1011',
      hobbyId: 'reading',
      title: 'Sunday reading reset',
      date: '2026-10-11',
      time: '20:00',
      minutes: 25,
      place: 'Sofa',
      tasks: tasks([['Read', 'Phone in another room', 25]]),
    }),
    // History
    session({
      id: 's-guitar-1004',
      hobbyId: 'guitar',
      title: 'Chord transition study',
      date: '2026-10-04',
      time: '17:00',
      minutes: 30,
      status: 'done',
      completedAt: '17:32',
      feeling: 'right',
      tasks: tasks([['G → Am → C loop', '8 clean loops', 30, true]]),
    }),
    session({
      id: 's-run-1003',
      hobbyId: 'running',
      title: 'Easy 3 km',
      date: '2026-10-03',
      time: '07:00',
      minutes: 25,
      status: 'done',
      completedAt: '07:27',
      tasks: tasks([['Easy run', 'Conversational effort', 25, true]]),
    }),
    session({
      id: 's-guitar-1002',
      hobbyId: 'guitar',
      title: 'Bars 1–4 slow practice',
      date: '2026-10-02',
      time: '18:30',
      minutes: 35,
      status: 'done',
      completedAt: '19:08',
      feeling: 'hard',
      tasks: tasks([['Bars 1–4', 'Metronome at 60%', 35, true]]),
    }),
    session({
      id: 's-paint-1001',
      hobbyId: 'painting',
      title: 'Cloud shapes study',
      date: '2026-10-01',
      time: '19:00',
      minutes: 40,
      status: 'done',
      completedAt: '19:44',
      tasks: tasks([['Cloud studies', 'Four quick sketches', 40, true]]),
    }),
  ]
}

const T = (
  id: string,
  name: string,
  description: string,
  icon: string,
  status: Trophy['status'],
  progress: number,
  total: number,
  extra: Partial<Trophy> = {},
): Trophy => ({ id, name, description, icon, status, progress, total, ...extra })

function seedTrophies(): Trophy[] {
  return [
    T('steady-hands', 'Steady Hands', 'Complete 10 focused guitar sessions.', 'front_hand', 'unlocked', 10, 10, {
      series: 'Mastery',
      rarity: 'Rare',
      unlockedOn: '2026-10-06',
      isNew: true,
    }),
    T('early-miles', 'Early Miles', 'Complete 5 morning runs.', 'wb_twilight', 'unlocked', 5, 5, { unlockedOn: '2026-09-28', isNew: true }),
    T('page-turner', 'Page Turner', 'Read on 14 days in a row.', 'auto_stories', 'unlocked', 14, 14, { unlockedOn: '2026-10-01', isNew: true }),
    T('first-note', 'First Note', 'Complete your first guitar session.', 'music_note', 'unlocked', 1, 1, { series: 'Mastery', unlockedOn: '2026-03-14', rarity: 'Common' }),
    T('warm-up-habit', 'Warm-up Habit', 'Start 10 sessions with a warm-up.', 'local_fire_department', 'unlocked', 10, 10, { series: 'Mastery', unlockedOn: '2026-06-02' }),
    T('first-light', 'First Light', 'Log a session before 7 AM.', 'wb_sunny', 'unlocked', 1, 1, { unlockedOn: '2026-04-11' }),
    T('five-a-week', 'Five a Week', 'Complete five sessions in one week.', 'event_available', 'unlocked', 5, 5, { unlockedOn: '2026-05-17' }),
    T('palette-starter', 'Palette Starter', 'Finish your first painting study.', 'palette', 'unlocked', 1, 1, { unlockedOn: '2026-04-20' }),
    T('home-cook', 'Home Cook', 'Cook three new recipes.', 'skillet', 'unlocked', 3, 3, { unlockedOn: '2026-07-09' }),
    T('ten-k-pages', 'Bookworm', 'Read 1,000 pages.', 'menu_book', 'unlocked', 1000, 1000, { unlockedOn: '2026-08-30' }),
    T('reflector', 'Reflector', 'Write 10 session reflections.', 'edit_note', 'unlocked', 10, 10, { unlockedOn: '2026-06-24' }),
    T('planner', 'Planner', 'Accept your first AI plan.', 'auto_awesome', 'unlocked', 1, 1, { unlockedOn: '2026-03-14' }),
    T('comeback', 'Comeback', 'Return to a paused hobby.', 'replay', 'unlocked', 1, 1, { unlockedOn: '2026-05-03' }),
    T('weekend-warrior', 'Weekend Warrior', 'Complete four weekend sessions.', 'weekend', 'unlocked', 4, 4, { unlockedOn: '2026-09-13' }),
    T('tempo-keeper', 'Tempo Keeper', '20 metronome sessions.', 'timer', 'progress', 14, 20, { series: 'Mastery' }),
    T('creative-week', 'Creative Week', 'Practice 5 different hobbies in one week.', 'interests', 'progress', 4, 5),
    T('deep-focus', 'Deep Focus', 'Complete 10 sessions of 45 minutes or more.', 'center_focus_strong', 'progress', 7, 10),
    T('weekly-chest', 'Weekly Chest', 'Complete two more sessions by Sunday.', 'redeem', 'progress', 3, 5),
    T('five-k', '5K Ready', 'Run 5 km without stopping.', 'directions_run', 'progress', 3, 5),
    T('month-streak', 'Month Streak', 'Keep any streak for 30 days.', 'calendar_month', 'progress', 18, 30),
    T('gallery', 'Gallery Wall', 'Finish 5 painting studies.', 'photo_frame', 'progress', 2, 5),
    T('chef-table', 'Chef’s Table', 'Cook 10 recipes.', 'restaurant', 'progress', 4, 10),
    T('night-owl', 'Night Owl', 'Log 10 evening sessions.', 'dark_mode', 'progress', 6, 10),
    T('stage-ready', 'Stage Ready', 'Play a full song from memory.', 'mic_external_on', 'locked', 0, 1, { series: 'Mastery' }),
    T('centurion', 'Centurion', 'Complete 100 sessions.', 'military_tech', 'locked', 0, 100),
    T('marathon-mind', 'Marathon Mind', 'Run 42 km in a month.', 'sprint', 'locked', 0, 42),
    T('polymath', 'Polymath', 'Reach level 5 in three hobbies.', 'hub', 'locked', 0, 3),
    T('year-of-making', 'Year of Making', 'Keep Daymark going for a year.', 'cake', 'locked', 0, 1),
    T('mentor', 'Mentor', 'Share a plan with a friend.', 'diversity_3', 'locked', 0, 1),
    T('virtuoso', 'Virtuoso', 'Finish 5 guitar goals.', 'workspace_premium', 'locked', 0, 5),
  ]
}

export function createSeed(): AppState {
  n = 0
  return {
    version: 1,
    profile: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      title: 'Curious Maker',
      memberSince: 'March 2026',
      xp: 1840,
      weekXp: 240,
      signedIn: false,
      onboarded: true,
    },
    hobbies: hobbyCatalog.map((h) => ({ ...h, goal: h.goal && { ...h.goal } })),
    sessions: seedSessions(),
    trophies: seedTrophies(),
    settings: {
      sessionReminders: true,
      reminderLead: 30,
      dailyAgenda: true,
      agendaTime: '07:00',
      streakNudges: true,
      autoBreakdown: true,
      smartRescheduling: true,
      personalization: true,
      quietStart: '21:30',
      quietEnd: '07:00',
    },
    preferences: {
      experience: 'Intermediate',
      intentions: ['routine', 'skill'],
      weeklyTarget: 4,
      availability: { days: [1, 3, 5, 6], times: ['morning', 'after-work'] },
    },
  }
}

/** XP needed to reach each level; index = level. */
export const LEVEL_XP = [0, 0, 100, 250, 450, 700, 1000, 1350, 1500, 2200, 3000, 4000, 5200]

export function levelFor(xp: number) {
  let level = 1
  for (let l = 1; l < LEVEL_XP.length; l++) if (xp >= LEVEL_XP[l]) level = l
  const floor = LEVEL_XP[level]
  const ceil = LEVEL_XP[level + 1] ?? floor + 1500
  return { level, toNext: ceil - xp, progress: (xp - floor) / (ceil - floor), nextAt: ceil }
}
