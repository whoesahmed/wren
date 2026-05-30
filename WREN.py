import pyttsx3
import wikipedia

# ── WREN — Wikipedia Research & Explanation Navigator ──

wren = pyttsx3.init()
voices = wren.getProperty('voices')
wren.setProperty('voice', voices[0].id)
wren.setProperty('rate', 150)


def speak(text):
    """Print and speak the given text."""
    print(text)
    wren.say(text)
    wren.runAndWait()


def search_wikipedia(query):
    """Search Wikipedia and speak the result."""
    try:
        result = wikipedia.summary(query, sentences=4)
        speak(result)

    except wikipedia.exceptions.DisambiguationError as e:
        speak("Your query is ambiguous. Here are some related topics:")
        for option in e.options[:3]:
            try:
                summary = wikipedia.summary(option, sentences=2)
                speak(f"{option}: {summary}")
            except Exception:
                continue

    except wikipedia.exceptions.PageError:
        results = wikipedia.search(query)
        if results:
            speak("I couldn't find an exact match, but here are related topics:")
            for title in results[:3]:
                try:
                    summary = wikipedia.summary(title, sentences=2)
                    speak(f"{title}: {summary}")
                except Exception:
                    continue
        else:
            speak("Sorry, I couldn't find anything on Wikipedia for that.")


# ── Main loop ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    speak("Hello! I'm WREN, your Wikipedia Research & Explanation Navigator.")
    user_name = input("Before we start, what's your name? ").strip()
    if not user_name:
        user_name = "friend"
    speak(f"Great to meet you, {user_name}! Ask me anything!")
    while True:
        query = input("\n🔎 Type your search (or 'exit' to quit): ").strip()
        if not query:
            continue
        if query.lower() in {"exit", "quit"}:
            speak(f"Take care, {user_name}. Goodbye!")
            break
        search_wikipedia(query)