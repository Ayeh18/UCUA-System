import { useEffect, useState, useRef } from "react";
import { FileText, Star, Info } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  type LeaderboardUser = {
    staff_id: string;
    points: number;
    reports: number;
    rank: number;
  };


  const [reportCount, setReportCount] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [points, setPoints] = useState({
    report_count: 0,
    daily_points: 0,
    bonus_points: 0,
    total_points: 0,
  });
  const [bonusGivenToday, setBonusGivenToday] = useState(false);
  const [dailyPointsGiven, setDailyPointsGiven] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const toggleInfoPanel = () => setShowInfo((prev) => !prev);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No access token found, redirecting...");
        navigate("/");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Step 1: Update user's points first
        const pointsRes = await axios.get("http://localhost:8000/update_points", { headers });
        const { report_count, daily_points, bonus_points, total_points } = pointsRes.data.points;
        setPoints({ report_count, daily_points, bonus_points, total_points });
        setBonusGivenToday(pointsRes.data.points.reports_today >= 3);
        setDailyPointsGiven(daily_points > 0);

        // Step 2: Then fetch leaderboard (which now uses the points table)
        const leaderboardRes = await axios.get("http://localhost:8000/leaderboard", { headers });
        setLeaderboard(leaderboardRes.data.leaderboard);
        setCurrentUser(leaderboardRes.data.current_user);

        // Step 3: Fetch individual report count (still useful for report card)
        const reportCountRes = await axios.get("http://localhost:8000/report_count", { headers });
        setReportCount(reportCountRes.data.report_count);
        console.log(reportCountRes.data); // Should log: { report_count: 1 }

      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/");
        } else {
          console.error("API fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-200 px-4 md:px-8 lg:px-12">
      <div className="min-h-screen p-6 max-w-6xl mx-auto pt-20">
        {/* Header */}
        <div className="flex justify-center items-center sm:items-center flex-row flex-wrap sm:flex-nowrap gap-2 sm:gap-0 mb-10 relative">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-800 flex items-center gap-3 text-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Dashboard
            </span>
          </h1>
          <div className="relative ml-auto mt-2" ref={panelRef}>
            <button
              onClick={toggleInfoPanel}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-200"
            >
              <Info className="w-7 h-7 sm:w-7 sm:h-7" />
              <span className="hidden sm:inline text-sm font-medium">Points Info</span>
            </button>

            {showInfo && (
              <div className="absolute right-0 top-10 sm:top-9 w-72 sm:w-80 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 animate-fade-in-down">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📘 Points Information
                </h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2 text-left">
                  <li><strong>Reports Submitted:</strong> How many reports you've made</li>
                  <li><strong>Total Points:</strong> Daily points + bonus points + report count</li>
                  <li><strong>Daily Points:</strong> +1 point for daily report submit</li>
                  <li><strong>Bonus Points:</strong> +5 points bonus if submit 3 reports or above</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4 italic text-right">
                  Click anywhere to close
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Reports Submitted */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl hover:scale-[1.03] transition hover:shadow-[0_10px_20px_rgba(99,102,241,0.4)]">
            <div className="flex items-center gap-4">
              <FileText className="text-indigo-600 w-10 h-10 drop-shadow-md" />
              <div>
                <p className="text-md font-semibold text-gray-600">Reports Submitted</p>
                <h2 className="text-4xl font-bold text-indigo-700">{reportCount ?? "N/A"}</h2>
              </div>
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-gradient-to-tr from-yellow-100 to-white p-6 rounded-3xl shadow-lg hover:scale-[1.03] transition hover:shadow-[0_10px_20px_rgba(234,179,8,0.4)]">
            <div className="flex items-center gap-4">
              <Star className="text-yellow-500 w-10 h-10 drop-shadow-md fill-yellow-500" />
              <div>
                <p className="text-md font-semibold text-gray-600">Total Points</p>
                <h2 className="text-4xl font-bold text-yellow-600">{points.total_points}</h2>
                {bonusGivenToday && (
                  <p className="text-green-600 text-xs mt-1 font-medium">🎁 +5 Daily Bonus Given</p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Submission Bonus */}
          <div className="bg-orange-100 p-6 rounded-3xl shadow-lg hover:scale-[1.03] transition flex items-center gap-4 hover:shadow-[0_10px_20px_rgba(251,146,60,0.4)]">
            <div className="text-5xl">🎯</div>
            <div>
              <p className="text-md font-semibold text-gray-600">Daily Submission Bonus</p>
              <h2 className="text-xl font-bold text-orange-500">
                {dailyPointsGiven ? "+1 Points Given Today" : "Submit today to earn +1 points"}
              </h2>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-300 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-blue-800 text-white py-6 px-4 sm:px-8">
            <div className="relative flex items-center justify-center min-h-[2.5rem]">
              <span className="absolute left-0 text-3xl sm:text-4xl">🏆</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight">Leaderboard</h2>
              <span className="absolute right-0 text-3xl sm:text-4xl">🏆</span>
            </div>
            <p className="text-sm sm:text-base text-purple-100 text-center mt-2 font-medium italic">
              Top 5 contributors of the month
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700 border border-gray-300 border-collapse">
              <thead className="bg-indigo-300">
                <tr className="uppercase text-xs tracking-wider text-gray-800">
                  <th className="px-6 py-3 text-left text-md border border-gray-400">Rank</th>
                  <th className="px-6 py-3 text-left text-md border border-gray-400">Staff ID</th>
                  <th className="px-6 py-3 text-left text-md border border-gray-400">Reports</th>
                  <th className="px-6 py-3 text-left text-md border border-gray-400">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {leaderboard.slice(0, 5).map((user, index) => {
                  const isCurrentUser = user.staff_id === currentUser;
                  const rankIcon =
                    index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;

                  return (
                    <tr
                      key={user.staff_id}
                      className={`${
                        isCurrentUser ? "bg-indigo-100 font-semibold" : "hover:bg-gray-50"
                      } transition-all`}
                    >
                      <td className="px-6 py-4 text-indigo-700 font-bold border border-gray-400">
                        {rankIcon}
                      </td>
                      <td className="px-6 py-4 border border-gray-400">
                        {user.staff_id}
                        {isCurrentUser && <span className="text-indigo-500 ml-1">(You)</span>}
                      </td>
                      <td className="px-6 py-4 border border-gray-400">{user.reports}</td>
                      <td className="px-6 py-4 border border-gray-400 text-yellow-600 font-semibold">
                        {user.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
