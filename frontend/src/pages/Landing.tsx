import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Car, Shield, Clock, Star, ArrowRight, CheckCircle, Zap, Users, Award } from 'lucide-react'
import { useEffect, useState } from 'react'

// Landing page (home): black hero with blended header and right-aligned nav
export default function Landing() {
  const { token } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden" style={{ cursor: 'none' }}>
      {/* Custom Cursor with Red Glow */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        animate={{
          x: -12,
          y: -12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      >
        <div className="relative">
          {/* Trail effect */}
          <div className="absolute inset-0 w-8 h-8 bg-red-500/20 rounded-full blur-lg animate-ping"></div>
          {/* Outer glow */}
          <div className="absolute inset-0 w-6 h-6 bg-red-500/30 rounded-full blur-md animate-pulse"></div>
          {/* Inner glow */}
          <div className="absolute inset-0 w-4 h-4 bg-red-400/50 rounded-full blur-sm"></div>
          {/* Core cursor */}
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
        </div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Header */}
        <header className="w-full backdrop-blur-sm bg-black/20 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
            <Link to="/" className="group">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">
                  Toyota <span className="text-red-500">Quote</span>
              </div>
              </motion.div>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/carRec"
                state={{ startQuiz: true }}
                className="group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
              >
                <Car className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Get Quote
              </Link>
              {token ? (
                <Link
                  to="/profile"
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                >
                  Profile
                </Link>
              ) : (
              <Link
                to="/signin"
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                Sign In
              </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative">
          <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
            {/* Supra Background Image - Only in Hero Section */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/supra.png')"
              }}
            />
            
            {/* Dark Overlay - Only in Hero Section */}
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="max-w-6xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Main headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                    Find Your Perfect
                    <span className="block bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                      TOYOTA
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                    Get personalized Toyota recommendations based on your budget, lifestyle, and preferences. 
                    Start your journey to the perfect vehicle today.
                  </p>
                </div>

                {/* CTA Button */}
                <motion.div 
                  className="flex justify-center items-center pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Link
                    to="/carRec"
                    state={{ startQuiz: true }}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:shadow-red-500/30 transform hover:scale-105"
                  >
                    Start Your Quote
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div 
                  className="flex flex-wrap justify-center items-center gap-8 pt-12 text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>5-Minute Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span>Expert Recommendations</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Why Choose Toyota Quote?
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  We make finding your perfect Toyota simple, fast, and personalized to your unique needs.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Car className="w-8 h-8" />,
                    title: "Personalized Matching",
                    description: "AI-powered recommendations based on your budget, lifestyle, and preferences."
                  },
                  {
                    icon: <Shield className="w-8 h-8" />,
                    title: "Secure Document Upload",
                    description: "Safely upload and manage your financing documents in one place."
                  },
                  {
                    icon: <Clock className="w-8 h-8" />,
                    title: "Quick & Easy Process",
                    description: "Get your personalized quote in minutes, not hours."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Car Showcase Section */}
          <section className="py-20 px-6 bg-gradient-to-b from-black/50 to-transparent">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Discover Your Perfect Match
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  From fuel-efficient hybrids to powerful SUVs, find the Toyota that matches your lifestyle and budget.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  {
                    icon: <Zap className="w-8 h-8" />,
                    title: "Hybrid & Electric",
                    description: "Eco-friendly options for the environmentally conscious driver.",
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    icon: <Users className="w-8 h-8" />,
                    title: "Family SUVs",
                    description: "Spacious and safe vehicles perfect for family adventures.",
                    color: "from-blue-500 to-cyan-600"
                  },
                  {
                    icon: <Award className="w-8 h-8" />,
                    title: "Luxury Sedans",
                    description: "Premium comfort and advanced technology in every detail.",
                    color: "from-purple-500 to-pink-600"
                  }
                ].map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                  >
                    <div className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                      <p className="text-white/70 leading-relaxed">{category.description}</p>
                    </div>
                    {/* Subtle car icon overlay */}
                    <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors">
                      <Car className="w-24 h-24" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              >
                {[
                  { number: "50+", label: "Toyota Models" },
                  { number: "25+", label: "Years Experience" },
                  { number: "10M+", label: "Happy Customers" },
                  { number: "99%", label: "Satisfaction Rate" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2 group-hover:scale-110 transition-transform">
                      {stat.number}
                    </div>
                    <div className="text-white/70 text-sm md:text-base">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-3xl p-12 border border-red-500/20"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Find Your Perfect TOYOTA?
            </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who found their ideal Toyota through our personalized recommendation system.
                </p>
                <Link
                  to="/carRec"
                  state={{ startQuiz: true }}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xl font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:shadow-red-500/30 transform hover:scale-105"
                >
                  Get Started Now
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
          </div>
        </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/60">© {new Date().getFullYear()} Toyota Quote — Your Perfect Match Awaits</span>
              </div>
              <div className="flex items-center gap-6 text-white/60">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact Us</span>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}


