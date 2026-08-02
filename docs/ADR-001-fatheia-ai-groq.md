# Architecture Decision Record (ADR-001)

## Title: Selection of Groq Llama-3.3-70B for Fatheia AI Assistant

**Date:** 2026-08-02
**Status:** Accepted

### 1. Context & Problem Statement
Fridge Fusion requires an AI conversational assistant ("Fatheia") capable of providing step-by-step culinary instructions, filtering non-food queries, and generating recipes dynamically based on user-provided ingredients.
The primary constraint is **latency**: users interacting with an AI chef while cooking require immediate responses. Traditional LLM inference via OpenAI (GPT-4) or local hosting often introduces 5–10 second TTFT (Time To First Token) delays, which disrupts the fast-paced kitchen experience.

### 2. Considered Options
* OpenAI API (GPT-4o or GPT-4o-mini)
* Anthropic API (Claude 3.5 Sonnet)
* Local HuggingFace Deployment (Llama 3 8B)
* **Groq LPU Inference Engine (Llama-3.3-70B-Versatile)**

### 3. Decision
We have decided to integrate **Groq's LPU (Language Processing Unit)** running the **Llama-3.3-70B** model.

### 4. Rationale
* **Sub-Second Latency:** Groq's specialized LPU architecture provides deterministic, high-throughput inference (often >800 tokens per second). This ensures Fatheia responds to user prompts in under 2 seconds, delivering a real-time conversational experience.
* **Cost Efficiency:** Groq's API pricing structure is highly competitive for the volume of interactive chat expected in a global community app.
* **Reasoning Capabilities:** The 70B parameter variant of Llama-3.3 provides sufficient logical reasoning to strictly adhere to the "food-only" system prompt constraints, politely declining political, mathematical, or coding queries.

### 5. Consequences
* **Positive:** Unmatched user experience regarding chat responsiveness. High adherence to persona constraints.
* **Negative:** Reliance on a third-party inference provider (Groq) rather than self-hosted hardware. Requires continuous monitoring of rate limits on the Groq free/developer tier.
