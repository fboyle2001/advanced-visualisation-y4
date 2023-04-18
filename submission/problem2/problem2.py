from http.server import test, SimpleHTTPRequestHandler
import os
import threading
import webbrowser

os.chdir("./build")
threading.Timer(2, lambda: webbrowser.open("http://localhost:8000", new=2)).start()
test(SimpleHTTPRequestHandler)
