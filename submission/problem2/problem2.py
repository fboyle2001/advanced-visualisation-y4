from http.server import test, SimpleHTTPRequestHandler
import os
import threading
import webbrowser

# Reference: https://stackoverflow.com/a/39801780 and https://stackoverflow.com/a/24580654
# Simply starts a server to open the GUI (required due to CORS issues otherwise)
os.chdir("./build")
threading.Timer(2, lambda: webbrowser.open("http://localhost:8000", new=2)).start()
test(SimpleHTTPRequestHandler)
