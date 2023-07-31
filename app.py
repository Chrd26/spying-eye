"""Import Flask."""
import re
import sqlite3
from flask import Flask, render_template, session, request 
from werkzeug.security import generate_password_hash

# app
app = Flask(__name__)

# Login Page
@app.route("/", methods=["GET", "POST"])
def login():
    """Render Index, Login Page."""
    return render_template("login.html")

# Register User
@app.route("/register", methods=["GET", "POST"])
def register():
    """Register User."""
    if request.method == "POST":
        # Create new sqlite connection
        con = sqlite3.connect("database.db")
        db_run = con.cursor()

        # Get mail, hashed password and chekc if mail already exists
        mail = request.form["mail"]
        password = generate_password_hash(request.form["password"], "scrypt")
        get_mail = db_run.execute("SELECT mail FROM users WHERE mail=mail")
        print(get_mail.fetchone())
        print(mail)
        print(password)

        if get_mail.fetchone() is None:
            # Add mail and hash to the database and
            # return login.html with a success message
            return render_template("login.html", success = "You have succesfuly created an account. You can login now.")

        # If mail exists in the database, render register.html again
        # and display a failed message
        return render_template("register.html", error = "The mail has been already registered.")
        # Check if user contains special characters
    return render_template("register.html")

# Load Index
@app.route("/index", methods=["GET", "POST"])
def index():
    """Load Index."""
    return render_template("index.html")


if __name__ == "__main__":
    app.run()
