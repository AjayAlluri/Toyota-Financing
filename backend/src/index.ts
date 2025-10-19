// index.ts
import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = 3000;



app.use(cors());
app.use(express.json());

// Initialize OpenAI client BEFORE using it
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Basic test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

// Register OpenAI route
registerOpenAIRoute(app);

app.listen(port, () => {
  console.log(`⚡ Server running at http://localhost:${port}`);
});

function registerOpenAIRoute(app: express.Application) {
  app.post("/api/generate", async (req: Request, res: Response) => {
    try {
      console.log("Received request body:", req.body);
      
      // Format user data into a compact string
      const userDataString = `${req.body.gross_monthly_income || 0}${req.body.other_monthly_income || 0}${req.body.fixed_monthly_expenses || 0}${req.body.liquid_savings || 0}${req.body.credit_score || 'unknown'}${req.body.ownership_horizon || 'unknown'}${req.body.annual_mileage || 'unknown'}${req.body.passenger_needs || 'unknown'}${req.body.commute_profile || 'unknown'}${req.body.down_payment || 0}`;
      
      const response = await openai.responses.create({
        model: "gpt-4.1",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `You are an automotive data and finance assistant focused on Toyota vehicles sold in the United States.

Task:
Return Toyota models and trims that fit within three price categories:
"Budget", "Balanced", and "Premium".
Each category must contain exactly 1 car, with estimated financing and leasing details.

====================================
USER FINANCIAL INPUT PARAMETERS
====================================
Use these parameters to refine affordability tiers and financing terms.

1. gross_monthly_income: ${req.body.gross_monthly_income || 0} USD
2. other_monthly_income: ${req.body.other_monthly_income || 0} USD
3. monthly_fixed_expenses: ${req.body.fixed_monthly_expenses || 0} USD
4. liquid_savings: ${req.body.liquid_savings || 0} USD
5. credit_score: ${req.body.credit_score || 'unknown'}
6. ownership_horizon: ${req.body.ownership_horizon || 'unknown'}
7. annual_mileage: ${req.body.annual_mileage || 'unknown'}
8. passenger_needs: ${req.body.passenger_needs || 'unknown'}
9. commute_profile: ${req.body.commute_profile || 'unknown'}
10. down_payment: ${req.body.down_payment || 0} USD

====================================
DATA SOURCE LIMITATIONS
====================================
You are allowed to visit only two websites for information:
1. The official Toyota USA website (toyota.com)
2. Kelley Blue Book (kbb.com)

Use these sites only to confirm:
- Current model year availability
- MSRP (USD)
- Mileage (MPG)
- Trim details
- Seating capacity

Do not use or reference any other sources.

Respond fast — prioritize concise, accurate results.

====================================
OUTPUT FORMAT
====================================
Return ONLY valid, parseable JSON with ACTUAL NUMBERS (not expressions or formulas).
Do NOT include any calculations like (4000+2000-1000)*0.15 - calculate and return the actual number.
Do NOT include markdown, code blocks, or any text outside the JSON object.

The output must be parseable JSON with this structure:

{
  "Budget": {
    "mileage": "string (e.g., '32 MPG combined')",
    "year": number,
    "make": "Toyota",
    "model": "string",
    "trim": "string",
    "headline_feature": "1–2 words",
    "price": number,
    "seats": number,
    "finance": {
      "apr_percent": number,
      "term_months": number,
      "estimated_monthly_payment": number
    },
    "lease": {
      "term_months": number,
      "estimated_monthly_payment": number,
      "annual_mileage_limit": number,
      "lease_score": number
    }
  },
  "Balanced": { /* same structure */ },
  "Premium": { /* same structure */ },
  "Affordability": {
    "monthly_cap": number,
    "price_max": number,
    "price_bands": {
      "Budget": number,
      "Balanced": number,
      "Premium": number
    },
    "financing_term_months": number,
    "apr_percent": number
  },
  "Recommendation": {
    "primary": "Finance or Lease",
    "lease_score": number,
    "reason": "1–2 line explanation"
  }
}

====================================
RULES
====================================
- Use only toyota.com and kbb.com for vehicle data.
- Include only real, currently available Toyota models (latest model year).
- Exclude Lexus, discontinued, or concept models.
- Each category must include exactly ONE car.
- Provide 3 cars with DIFFERENT price ranges (low, medium, high).
- The backend will automatically sort them: cheapest → Essential, middle → Comfort, most expensive → Premium.
- All prices and APR estimates must reflect current U.S. averages.
- Headline_feature must be concise (≤2 words).
- Output strictly valid JSON with ACTUAL CALCULATED NUMBERS ONLY.
- Do NOT include markdown, source citations, or any text after the JSON object.
- Do NOT use mathematical expressions - calculate them to actual numbers.
- Prioritize response speed and structured accuracy.`
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Using the financial parameters provided above, calculate and recommend the 3 best Toyota cars (Budget, Balanced, Premium) with all the required information in JSON format.`
              }
            ]
          }
        ],
        text: {
          format: {
            type: "text"
          }
        },
        reasoning: {},
        tools: [
          {
            type: "web_search",
            filters: null,
            search_context_size: "medium",
            user_location: {
              type: "approximate",
              city: null,
              country: null,
              region: null,
              timezone: null
            }
          }
        ],
        temperature: 1,
        max_output_tokens: 4096,
        top_p: 1,
        store: true,
        include: ["web_search_call.action.sources"]
      } as any);

      console.log("\n=== OpenAI Raw Response ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      
      // Extract the text content from the response
      let content = "";
      
      if (response.output && response.output.length > 0) {
        const lastOutput: any = response.output[response.output.length - 1];
        
        if (lastOutput.content && Array.isArray(lastOutput.content)) {
          const textContent = lastOutput.content.find((c: any) => c.type === "output_text");
          content = textContent?.text || "";
        }
      }
      
      console.log("\n=== Message Content ===");
      console.log(content);
      
      // Extract only the JSON object (remove any extra text like sources, "Paid.", etc.)
      let jsonString = content.trim();
      
      // Find the first { and last }
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
      
      const out = jsonString ? JSON.parse(jsonString) : {};
      
      // Sort cars by price: Most expensive = Premium, Middle = Comfort, Cheapest = Essential
      if (out.Budget && out.Balanced && out.Premium) {
        const cars = [
          { category: 'Budget', data: out.Budget, price: out.Budget.price || 0 },
          { category: 'Balanced', data: out.Balanced, price: out.Balanced.price || 0 },
          { category: 'Premium', data: out.Premium, price: out.Premium.price || 0 }
        ];
        
        // Sort by price (ascending: cheapest first)
        cars.sort((a, b) => a.price - b.price);
        
        // Reassign based on price order
        out.Budget = cars[0]?.data;    // Cheapest = Essential
        out.Balanced = cars[1]?.data;  // Middle = Comfort  
        out.Premium = cars[2]?.data;   // Most expensive = Premium
        
        console.log("\n=== Sorted by Price ===");
        console.log(`Essential (Budget): ${cars[0]?.data?.model || 'Unknown'} - $${cars[0]?.price || 0}`);
        console.log(`Comfort (Balanced): ${cars[1]?.data?.model || 'Unknown'} - $${cars[1]?.price || 0}`);
        console.log(`Premium: ${cars[2]?.data?.model || 'Unknown'} - $${cars[2]?.price || 0}`);
      }
      
      console.log("\n=== Final JSON ===");
      console.log(JSON.stringify(out, null, 2));

      res.json(out);
    } catch (e) {
      const error = e as Error;
      console.error("Error in /api/generate:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error?.message || "OpenAI call failed" });
    }
  });
}