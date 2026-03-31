import speech_recognition as sr

def get_command():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        print("\n🎤 Listening... Speak now")
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)

    try:
        command = r.recognize_google(audio)
        print("🗣️ You said:", command)
        return command.lower()

    except sr.UnknownValueError:
        print("❌ Could not understand")
        return ""

    except sr.RequestError:
        print("❌ API error")
        return ""