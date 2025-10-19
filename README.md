# Toyota Quote - AI-Powered Vehicle Financing Assistant

An intelligent car financing and leasing recommendation platform that uses OpenAI's API with web search to provide personalized Toyota vehicle recommendations based on your financial profile and lifestyle needs.

![Toyota Quote](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple?logo=openai)

## 🚀 Features

### Intelligent Vehicle Recommendations
- **AI-Powered Analysis**: Uses OpenAI's GPT-4o with web search to find the best Toyota vehicles for your budget
- **Real-Time Data**: Fetches current pricing, APR rates, and lease terms from toyota.com and kbb.com
- **Three Tier System**: Get personalized recommendations across Budget, Balanced, and Premium categories

### Interactive Financial Calculator
- **Dynamic Finance Calculator**: Adjust down payment and loan term with real-time monthly payment updates
- **Lease Calculator**: Customize lease terms and annual mileage with instant payment adjustments
- **Live Calculations**: Uses actual loan amortization formulas for accurate estimates

### Personalized Questionnaire
- **10-Question Assessment**: Comprehensive financial and lifestyle analysis
- **Smart Recommendations**: Based on:
  - Income and expenses
  - Credit score range
  - Ownership horizon
  - Annual mileage
  - Passenger needs
  - Commute profile

### Beautiful UI/UX
- **Modern Design**: Clean, Toyota-branded interface with smooth animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Sliders**: Real-time adjustment of financial parameters
- **Image Carousel**: Multiple views for each recommended vehicle

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **OpenAI API** - AI recommendations with web search
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Toyota-Financing.git
cd Toyota-Financing
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=your-actual-openai-api-key-here
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## 🚀 Running the Application

### Development Mode

You'll need **two terminal windows** - one for frontend, one for backend.

#### Terminal 1: Start the Backend
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3000`

#### Terminal 2: Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

### Production Build

#### Build the Frontend
```bash
cd frontend
npm run build
```

#### Build the Backend
```bash
cd backend
npm run build
```

## 📁 Project Structure

```
Toyota-Financing/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # Application entry point
│   │   ├── index.css        # Global styles
│   │   └── components/      # Reusable UI components
│   │       └── ui/          # Radix UI components
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
│
├── backend/                 # Express backend server
│   ├── src/
│   │   └── index.ts         # Main server file with OpenAI integration
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── .env                 # Environment variables (create this!)
│
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔄 How It Works

### 1. User Journey
```
User fills questionnaire → Backend sends to OpenAI → AI searches web for data → 
Returns 3 vehicle recommendations → Frontend displays with interactive calculators
```

### 2. OpenAI Integration
- Uses **OpenAI Responses API** with `gpt-4o` model
- **Web Search Tool**: Searches toyota.com and kbb.com for real-time data
- **Structured Output**: Returns JSON with vehicle specs, pricing, and financing terms

### 3. Financial Calculations

#### Finance Monthly Payment
```typescript
payment = (loanAmount × monthlyRate × (1 + monthlyRate)^months) / 
          ((1 + monthlyRate)^months - 1)
```

#### Lease Payment Adjustment
```typescript
adjustedPayment = basePayment × mileageMultiplier × termMultiplier
```
- **Mileage**: +3% per 2,500 miles over 12,000/year base
- **Term**: ±1-1.5% per 6 months from 36-month base

## 🌐 API Endpoints

### `POST /api/generate`
Generates personalized vehicle recommendations based on user financial profile.

**Request Body:**
```json
{
  "gross_monthly_income": 4000,
  "other_monthly_income": 2000,
  "fixed_monthly_expenses": 1000,
  "liquid_savings": 10000,
  "credit_score": "580-669 (Fair)",
  "ownership_horizon": "5-6 years",
  "annual_mileage": "10,000-15,000",
  "passenger_needs": "2-3 people",
  "commute_profile": "City driving",
  "down_payment": 100
}
```

**Response:**
```json
{
  "Budget": {
    "year": 2025,
    "make": "Toyota",
    "model": "Corolla",
    "trim": "LE",
    "price": 23460,
    "mileage": "35 MPG combined",
    "seats": 5,
    "headline_feature": "Compact efficiency",
    "finance": {
      "apr_percent": 5.99,
      "term_months": 60,
      "estimated_monthly_payment": 451
    },
    "lease": {
      "term_months": 36,
      "estimated_monthly_payment": 269,
      "annual_mileage_limit": 10000,
      "lease_score": 75
    }
  },
  "Balanced": { /* ... */ },
  "Premium": { /* ... */ },
  "Affordability": { /* ... */ },
  "Recommendation": { /* ... */ }
}
```

## 🐛 Troubleshooting

### Backend Issues

#### `Missing credentials` Error
```bash
OpenAIError: Missing credentials. Please pass an apiKey...
```
**Solution**: Ensure `.env` file exists in `backend/` directory with valid `OPENAI_API_KEY`

#### `TypeError: Unknown file extension ".ts"`
**Solution**: Use `tsx` instead of `ts-node`:
```bash
npm run dev  # This uses tsx
```

#### `Port 3000 already in use`
**Solution**: Kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend Issues

#### `Failed to load resource: 500 (Internal Server Error)`
**Solution**: 
1. Check backend terminal for error messages
2. Verify backend is running on port 3000
3. Ensure OpenAI API key is valid

#### CORS Errors
**Solution**: Backend already has CORS enabled. If issues persist:
1. Clear browser cache
2. Restart both frontend and backend servers

### OpenAI API Issues

#### `400 Bad Request`
**Solution**: 
- Check that you're using `gpt-4o` (not `gpt-4.1` or other invalid models)
- Verify your OpenAI account has API access enabled

#### `Rate Limit Exceeded`
**Solution**: 
- Wait a few moments and try again
- Check your OpenAI usage limits at [platform.openai.com](https://platform.openai.com/usage)

## 💡 Usage Tips

1. **Credit Score Impact**: Better credit scores result in lower APR recommendations
2. **Down Payment**: Higher down payments significantly reduce monthly payments
3. **Lease vs Finance**: Leasing typically offers lower monthly payments but no ownership
4. **Mileage Consideration**: High annual mileage makes financing more economical than leasing
5. **Term Length**: Longer terms = lower monthly payments but more total interest

## 🔐 Security Notes

- **Never commit** `.env` files to version control
- **API keys** should be kept secret and rotated regularly
- **Backend validation** sanitizes all user inputs
- **HTTPS recommended** for production deployments

## 📝 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes | `sk-proj-...` |
| `PORT` | Backend server port | No | `3000` (default) |

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` directory
3. Set environment variable for API URL if needed

### Backend (Railway/Render/Heroku)
1. Ensure `package.json` has `start` script
2. Set `OPENAI_API_KEY` environment variable
3. Deploy from GitHub or via CLI

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amogh Sood**

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - AI recommendations with web search
- [Toyota](https://www.toyota.com/) - Vehicle data source
- [Kelley Blue Book](https://www.kbb.com/) - Pricing and specifications
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Made with ❤️ for Toyota enthusiasts**
