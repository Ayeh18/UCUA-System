// Shapes returned by the backend (see backend/app/schemas).

export interface MessageResponse {
  message: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface UserProfile {
  staff_id: string;
  name: string | null;
  username: string | null;
  display_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  department: string | null;
  profile_pic_url: string | null;
}

export interface ReportCreatedResponse {
  message: string;
  image_count: number;
}

export interface UserStats {
  report_count: number;
  daily_points: number;
  bonus_points: number;
  total_points: number;
  reports_today: number;
  daily_point_earned_today: boolean;
  bonus_earned_today: boolean;
  rank: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  staff_id: string;
  name: string | null;
  reports: number;
  points: number;
}

export interface DashboardSummary {
  period_start: string;
  current_user: string;
  stats: UserStats;
  leaderboard: LeaderboardEntry[];
}
