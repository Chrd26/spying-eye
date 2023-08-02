"""Import Flask."""
from os import getenv
from json import load
from typing import Dict, Optional
import sqlite3
from flask import Flask, render_template, session, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, current_user, logout_user

# app config and global variables
app = Flask(__name__)
app.config["SECRET_KEY"] = getenv("SECRET_KEY", default="seewhoistheboss!")
l_manager = LoginManager(app)
users: Dict[str, "User"] = {}

# Custom row factory
# source: https://docs.python.org/3/library/sqlite3.html#sqlite3-howto-row-factory
def dict_factory(cursor, row):
    """Get row factory and return dict with keys and values."""
    fields = [column[0] for column in cursor.description]
    return dict(zip(fields, row))


class User(UserMixin):
    """User object. Session and login implementation by leynier"""
    # Source: https://github.com/leynier/flask-login-without-orm/blob/main/flask_login_without_orm/main.py#L41C1-L41C1

    def __init__(self, id:str, email:str, password:str):
        """Initialize"""
        self.id = id
        self.email = email
        self.password = password

    # What is the -> operator?
    # This is a function notation, it is used for documentation,
    # tell the IDE what data type it should return, it implements type checking
    # Source: https://peps.python.org/pep-0362/ and https://stackoverflow.com/questions/14379753/what-does-mean-in-python-function-definitions
    @staticmethod
    def get(user_id: str) -> Optional["User"]:
        """Get User id."""
        return users.get(user_id)

    def __str__(self) -> str:
        """Return a string with id and email."""
        return f"id: {self.id}, email: {self.email}"

    def __repr__(self) -> str:
        """Return object."""
        return self.__str__()


with open("users.json") as file:
    data = load(file)

    # Iterate through the json file
    # grab id. email and password
    # asign to users[key] a User() object
    for key in data:
        users[key] = User(
            id = key,
            email = data[key]["email"],
            password = data[key]["password"]
        )

@l_manager.user_loader
def load_user(user_id:str) -> Optional[User]:
    """Load user."""
    return User.get(user_id)

# Login Page
@app.route("/", methods=["GET", "POST"])
def login():
    """Render Index, Login Page."""
    if request.method == "POST":
        # connect to db
        db = sqlite3.connect("database.db")

        # Get Info
        mail = request.form["mail"]
        password = request.form["password"]
        print(mail)
        get_password = db.execute("SELECT hash FROM users WHERE mail = ?", (mail,))

        # Get the first element of fetchone()
        # this removes any parentheses,
        # Source: https://stackoverflow.com/questions/25655531/python-sqlite-return-value
        try:
            db_password = str(get_password.fetchone()[0])
        except db_password:
            db.close()
            return render_template("login.html", message = "User not found")

        # print(db_password)
        # print(check_password_hash(db_password, str(password)))

        # Check if there the user's password match with the one in the database
        # Source : https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        # and https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        if check_password_hash(db_password, str(password)):
            db.row_factory = dict_factory
            users = db.execute("SELECT * FROM users")
            users = users.fetchall()
            if mail in users[0]["mail"]:
                print("found!")
            print(users)
            db.close()
            return render_template("index.html")

        db.close()
        # Go back to login page and print out wrong credentials to the user
        return render_template("login.html", message = "Wrong credentials!")
    return render_template("login.html")

# Register User
@app.route("/register", methods=["GET", "POST"])
def register():
    """Register User."""
    if request.method == "POST":
        # Create new sqlite connection
        # To handle sqlite3 database we need to do the following:
        # Open a connection, assign the cursor method to a variable
        # execute the needed queries
        # commit any changes to the database
        # source: https://docs.python.org/3/library/sqlite3.html
        db = sqlite3.connect("database.db")

        # Get mail, hashed password, confirmation and check if mail already exists
        # source: https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        # and https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        mail = request.form["mail"]
        confirmation = request.form["confirmation"]
        password_input = request.form["password"]

        if confirmation != password_input:
            return render_template("register.html", message="Passwor and confirmatiomn fields must be the same")

        password = generate_password_hash(request.form["password"], "scrypt")
        get_mail = db.execute("SELECT mail FROM users WHERE mail=mail")
        print(get_mail.fetchone())
        print(mail)
        print(password)

        if get_mail.fetchone() is None:
            # Add mail and hash to the database and
            # return login.html with a success message
            db.execute("INSERT INTO users (mail, hash) VALUES (?, ?)", (mail, password))
            db.commit()
            db.close()
            return render_template("login.html", message =
                                   "You have succesfuly created an account. You can login now.")

        # If mail exists in the database, render register.html again
        # and display a failed message
        return render_template("register.html", message = "Email already exists.")
        # Check if user contains special characters
    return render_template("register.html")

# Load Index
@app.route("/index", methods=["GET", "POST"])
def index():
    """Load Index."""
    return render_template("index.html")

# load detection
@app.route("/start", methods=["GET", "POST"])
def start():
    """Start detecting objects."""
    return render_template("detection.html")

@app.route('/logout', methods=["GET", "POST"])
def logout():
    """Log out user."""
    return render_template("login.html", message = "You have logged out.")

if __name__ == "__main__":
    app.run(debug = True)
