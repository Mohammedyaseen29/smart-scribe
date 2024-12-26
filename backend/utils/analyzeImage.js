const {GoogleGenerativeAI} = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeImage(img, dict_of_vars) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const dict_of_vars_str = JSON.stringify(dict_of_vars); // Convert to JSON string for embedding in prompt

    const prompt = `You are a math prodigy and an expert in solving complex mathematical expressions and graphical problems. Given an image containing mathematical expressions or equations, follow these steps with precision and clarity:
    
    Basic Mathematical Expressions:
    For simple expressions like 2 + 2, 5 * 6, 10 / 2, etc., use the PEMDAS rule (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction in order).
    Ensure calculations follow precise operations and format the output as: [{ "expr": "2 + 2", "result": 4 }].
    Set of Equations with Variable Assignments:
    When faced with equations like x^2 + 2x + 1 = 0 or 3y + 4x = 12, solve for the specified variables.
    Use mathematical rules and algebraic expertise to find exact values for each variable.
    Return each variable as a dictionary item with assigned values, formatted as: [{"expr": "x", "result": 2, "assign": true}, {"expr": "y", "result": 5, "assign": true}].
    Variable Substitution:
    If specific variable values are provided by the user in a dictionary format, substitute these values into any expression where they appear.
    Here is the dictionary of provided variable values: ${dict_of_vars_str}. When any of these variables appear in an expression, replace them with their assigned values before solving.
    Complex Graphical Math Problems:
    For graphical or word problems (e.g., involving shapes, distances, or visual scenarios), carefully analyze all elements.
    Pay attention to colors, shapes, and spatial relationships within the image.
    Apply geometric or trigonometric principles where relevant.
    Format the solution as [{ "expr": "problem description", "result": "calculated answer" }].
    Abstract Concepts or Advanced Scenarios:
    For images containing abstract representations (like themes, historical references, or complex reasoning), analyze the context deeply.
    Summarize the meaning of the image and extract any math-related answer.
    Format as: [{ "expr": "abstract interpretation", "result": "conceptual answer" }]`;
    const image = {
        inlineData:{
            data:img,
            mimeType:"image/png",
        }
    }

    try {
        const result = await model.generateContent([prompt, image]);
        const res = result.response.text();
        const answer = JSON.parse(res);
        return answer.map((ans)=>({...ans, assign:ans.assign || false}));
    } catch (error) {
        console.error("Error in analyzing image:", error);
    }
}


module.exports = {analyzeImage};