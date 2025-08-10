import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center scale-110 brightness-75 blur-sm"
          style={{
            backgroundImage: "url('src/assets/tb_supply_base_cover.jpeg')", // Update path if needed
          }}
        />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white/10 border border-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-12 max-w-[90%] sm:max-w-[600px] lg:max-w-[800px] transition duration-300">
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <img
              src="src/assets/tbsb.png"
              alt="Tok Bali Supply Base"
              className="w-60 sm:w-60 md:w-72 h-auto drop-shadow-lg py-6"
            />
            <h1 className="text-white font-bold text-3xl sm:text-3xl md:text-4xl leading-tight tracking-wide ">
              Welcome to <br className="sm:hidden mb-4" />
              <span className="text-indigo-400 text-4xl font-extrabold">e-UCUA</span>
            </h1>

            <p className="text-white/90 font-medium text-md sm:text-base md:text-lg max-w-xl">
              Behavior or Condition Monitoring Form at TBSB
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-10 mt-6">
              <Link to="/form-visitor">
                <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-16 sm:px-10 py-5 rounded-3xl text-lg sm:text-base font-semibold shadow-lg hover:scale-105 transition-all duration-300">
                  Visitor
                </button>
              </Link>
              <Link to="/login">
                <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-16 sm:px-10 py-5 rounded-3xl text-lg sm:text-base font-semibold shadow-lg hover:scale-105 transition-all duration-300 mt-1">
                  Staff
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
