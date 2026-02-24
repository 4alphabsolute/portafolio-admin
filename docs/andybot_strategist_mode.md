# AndyBot - Career Strategist Mode (v2.0)
*Status: Active / Production Ready*

## Overview
This document outlines the architecture and implementation details of the new "Strategist Mode" in AndyBot. This feature transforms the existing chatbot into an intelligent career strategist capable of analyzing job vacancies and dynamically generating highly targeted, hybrid CVs in PDF format on the fly.

## Core Features
1. **Multi-modal Intake**: Accepts text and image uploads (screenshots) representing job vacancies.
2. **Hidden Authentication**: Uses a specific passphrase to enter "Strategist Mode".
3. **Dynamic CV Generation**: Uses Gemini 2.5 Flash to synthesize targeted profile descriptions and focus skills based *only* on the hardcoded capabilities of the user.
4. **On-the-fly PDF Rendering**: Intercepts the generated JSON instructions and seamlessly produces a high-fidelity PDF CV matching the original layout.

## Triggering the Experience
- **Identity Prompt**: User says `"Soy Andrés"` (or similar).
- **Authentication**: Bot challenges with "dime el santo y seña".
- **Passphrase**: User responds with `"Andy, modo estratega"`.
- **Activation**: The `UserProfile.type` state switches to `strategist`.

## Component Architecture

### 1. `AndyChat.tsx` (The Controller)
Manages the user interface, file attachments, and Gemini API coordination.

- **State Additions**:
  - `UserProfile.type` expanded to include `'strategist'`.
  - Added `images` array (`File[]`) state to handle multi-modal inputs.
- **Input Handling**:
  - Added `<input type="file" accept="image/*">` for direct uploads.
  - Implemented `onPaste` event listener to capture images directly from the clipboard (`Ctrl + V`).
- **Prompt Strategy**:
  When in `strategist` mode, `AndyChat` completely bypasses the standard persona prompt. Instead, it injects a highly structured JSON-enforcement prompt. It feeds Gemini the hardcoded base experience (e.g., Seguros, Banco Universal) and instructs it to strictly output a JSON object containing:
  - `profile.title`
  - `profile.description`
  - `profile.skills_focus`
  - `experience` (tailored bullet points)
  - `suggestedFilename`

### 2. `pdfGenerator.ts` (The Rendering Engine)
Refactored to decouple the drawing logic from static JSON files.

- **`generateCVFromData(profile, experience, language, filename)`**:
  The new core function. It accepts arbitrary profile and experience objects (matching the `CVProfileData` and `CVExperienceData` interfaces). It retains the exact `jsPDF` coordinate math, fonts, colors, and layout structure of the original static generator.

## Flow Execution
1. **User Request**: User pastes an image of a Data Analyst vacancy.
2. **Gemini Processing**: `send()` converts the image to base64 `inlineData` and passes it alongside the structural prompt to `gemini-2.5-flash`.
3. **Synthesis**: Gemini analyzes the vacancy, maps it against the injected base experience, and returns a raw JSON string.
4. **Parsing**: `AndyChat` intercepts the text, strips any Markdown codeblock wrappers (` ```json `), and runs `JSON.parse()`.
5. **PDF Dispatch**: Passing the parsed JSON directly into `generateCVFromData`, triggering an immediate browser download formatted as `CV_AndresAlmeida_[Rol]_[Fecha].pdf`.
6. **Success Audit**: Returns a clean summary in the chat window of the applied strategy (Title and Key Skills used).

## Future Considerations
- Currently, the base experience injected into the prompt is a subset of the data in `cvProfiles.json`. To prevent token bloat, not all variants are sent. As the profile expands, consider a RAG (Retrieval-Augmented Generation) approach to fetch only the relevant base experiences before sending to Gemini.
