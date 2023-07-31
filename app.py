"""Import Flask."""
import sqlite3
from flask import Flask, render_template, session, request, redirect
from werkzeug.security import generate_password_hash, check_password_hash
import flask_login

# app
app = Flask(__name__)
app.secret_key = "gatherthosewhoareweek!"

# login manager
login_manager = flask_login.LoginManager()
login_manager.init_app(app)
users = {"email": "none", "password": "none"}

# Create a User object to handle session
# source: https://pypi.org/project/Flask-Login/
class User(flask_login.UserMixin):
    """Handle User Login."""
    pass


    @login_manager.user_loader
    def user_loader(email):
        """Load user."""
        if email not in users:
            return

        user = User()
        user.id = email
        return user


    @login_manager.request_loader
    def request_loader(request):
        """Handle Requests."""
        email = request.form.get('email')
        if email not in users:
            return

        user = User()
        user.id = email
        return user


# Login Page
@app.route("/", methods=["GET", "POST"])
def login():
    """Render Index, Login Page."""
    if request.method == "POST":
        # connect to db
        con = sqlite3.connect("database.db")
        db_run = con.cursor()

        # Get Info
        mail = request.form["mail"]
        password = request.form["password"]
        print(mail)
        get_password = db_run.execute("SELECT hash FROM users WHERE mail = ?", (mail,))

        # Get the first element of fetchone()
        # this removes any parentheses,
        # Source: https://stackoverflow.com/questions/25655531/python-sqlite-return-value
        try:
            db_password = str(get_password.fetchone()[0])
        except db_password:
            return render_template("login.html", message = "User not found")

        # print(db_password)
        # print(check_password_hash(db_password, str(password)))

        # Check if there the user's password match with the one in the database
        # Source : https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        # and https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        if check_password_hash(db_password, str(password)):

            # get user
            # source: https://pypi.org/project/Flask-Login/
            users["email"] = mail
            users["password"] = password
            user = User()
            user.id = mail
            flask_login.login_user(user)

            return render_template("index.html")

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
        con = sqlite3.connect("database.db")
        db_run = con.cursor()

        # Get mail, hashed password and check if mail already exists
        # source: https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        # and https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        mail = request.form["mail"]
        password = generate_password_hash(request.form["password"], "scrypt")
        get_mail = db_run.execute("SELECT mail FROM users WHERE mail=mail")
        print(get_mail.fetchone())
        print(mail)
        print(password)

        if get_mail.fetchone() is None:
            # Add mail and hash to the database and
            # return login.html with a success message
            db_run.execute("INSERT INTO users (mail, hash) VALUES (?, ?)", (mail, password))
            con.commit()
            con.close()
            return render_template("login.html", message = 
                                   "You have succesfuly created an account. You can login now.")

        # If mail exists in the database, render register.html again
        # and display a failed message
        return render_template("register.html", message = "The mail has been already registered.")
        # Check if user contains special characters
    return render_template("register.html")

# Load Index
@app.route("/index", methods=["GET", "POST"])
@flask_login.login_required
def index():
    """Load Index."""
    return render_template("index.html")

@app.route('/logout', methods=["GET", "POST"])
def logout():
    """Log out user."""
    flask_login.logout_user()
    return render_template("login.html", message = "You have logged out.")

@login_manager.unauthorized_handler
def unauthorized_handler():
    """Handle Unauthorized access."""
    return 'Unauthorized', 401


if __name__ == "__main__":
    app.run()
