
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API KEY from your config
const API_KEY = "AIzaSyB8CN7Kd_RknyV-u_C52n-Iu_USJO7kUtc";

async function checkModels() {
    console.log("🔍 Checking available Gemini models for your API Key...");
    const genAI = new GoogleGenerativeAI(API_KEY);

    // List of models to test
    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    let foundWorkingModel = false;

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            const text = response.text();
            
            if (text) {
                console.log(`✅ SUCCESS! Model '${modelName}' works.`);
                console.log(`   Response: ${text.substring(0, 50)}...`);
                foundWorkingModel = true;
                // We found a working model, but let's check others too just in case
            }
        } catch (error) {
            console.log(`❌ Failed '${modelName}': ${error.message.split('\n')[0]}`);
            
            // If the error contains a list of valid models, print it!
            if (error.message.includes("models/")) {
                 const possibleModels = error.message.match(/models\/[a-zA-Z0-9.-]+/g);
                 if (possibleModels) {
                     console.log("   💡 Hint from API - Available models might include:");
                     possibleModels.forEach(m => console.log(`      - ${m.replace('models/', '')}`));
                 }
            }
        }
    }

    if (!foundWorkingModel) {
        console.log("\n⚠️  No working model found in the standard list.");
        console.log("Trying to force-list models via error...");
        try {
            const model = genAI.getGenerativeModel({ model: "invalid-model-name-to-force-list" });
            await model.generateContent("test");
        } catch (error) {
             if (error.message.includes("models/")) {
                 const possibleModels = error.message.match(/models\/[a-zA-Z0-9.-]+/g);
                 if (possibleModels) {
                     console.log("📋 Full list of models available to your key (from error message):");
                     possibleModels.forEach(m => console.log(`   - ${m.replace('models/', '')}`));
                 }
            } else {
                console.log("Could not retrieve model list from error message.");
            }
        }
    }
}

checkModels();
