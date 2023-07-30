"""Import Flask."""
from flask import Flask, render_template, session

# app
app = Flask(__name__)

# Login Page
@app.route("/", methods=["GET", "Method"])
def login():
    """Render Index, Login Page."""
    return render_template("index.html")

# Register User
@app.route("/register", methods=["GET", "POST"])
def register():
    """Register User."""

# Load Index
@app.route("/index", methods=["GET", "POST"])
def index():
    """Load Index."""


if __name__ == "__main__":
    app.run()
