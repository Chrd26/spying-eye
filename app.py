"""Import Flask."""
import sqlite3
from flask import Flask, render_template, session, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash 
import flask_login
from flask_cors import CORS
# app
app = Flask(__name__)
CORS(app)
app.secret_key = "thissecretkeyisactuallyquiteuseful!"

# Run flask app with debug on, Source: https://www.askpython.com/python-modules/flask/flask-debug-mode
app.debug = True
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

def dict_factory(cursor, row):
    """Get row factory and return dict with keys and values."""
    fields = [column[0] for column in cursor.description]
    return dict(zip(fields, row))

class User(flask_login.UserMixin):
    """Handle session."""

    @login_manager.user_loader
    def user_loader(username):
        """Load user."""
        db = sqlite3.connect("database.db")
        db.row_factory = dict_factory
        users = db.execute("SELECT * FROM users")
        users = users.fetchall()

        # Enumerate users
        # It is considered a good practice to 
        # enumerate through a list
        # instead of using a for loop
        # Source: https://www.geeksforgeeks.org/enumerate-in-python/
        for elem in enumerate(users):
            if elem[1]["username"] == username:
                user = User()
                user.id =  username
                db.close
                return user

        # return
        # login page with message
        db.close()
        return redirect(url_for("index", message = "User not found!")) 

    @login_manager.request_loader
    def request_loader(request):
        """Request Loader."""
        # Make sure that /register doesn't trigger that. Source: 
        # https://stackoverflow.com/questions/15974730/how-do-i-get-the-different-parts-of-a-flask-requests-url
        if request.method == "POST" and str(request.url_rule) != "/register":

            username = request.form["username"]
            db = sqlite3.connect("database.db")
            db.row_factory = dict_factory
            users = db.execute("SELECT * FROM users")
            users = users.fetchall()

            # Enumerate users
            for elem in enumerate(users):
                if elem[1]["username"] == username:
                    user = User()
                    user.id = username
                    db.close
                    return user
        
            # if email not found, then return nothing
            # login page with message
            db.close()
            return redirect(url_for("index", message = "User not found!")) 
    

# Login Page
@app.route("/", methods=["GET", "POST"])
def login():
    """Render Index, Login Page."""
    if request.method == "POST":
        # connect to db
        db = sqlite3.connect("database.db")

        # Get Info
        username = request.form["username"]
        password = request.form["password"]
        print(username)
        get_password = db.execute("SELECT hash FROM users WHERE username = ?", (username,))

        # Get the first element of fetchone()
        # this removes any parentheses,
        # Source: https://stackoverflow.com/questions/25655531/python-sqlite-return-value
        try:
            db_password = str(get_password.fetchone()[0])
        except:
            db.close()
            return render_template("login.html", message = "User not found")

        # print(db_password)
        # print(check_password_hash(db_password, str(password)))

        # Check if there the user's password match with the one in the database
        # Source : https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        # and https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        if check_password_hash(db_password, str(password)):
            user = User()
            user.id = username 
            flask_login.login_user(user)
            db.close()
            return redirect(url_for("index")) 

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
        #cprint(str(request.url_rule) == "/register")
        # Get mail, hashed password, confirmation and check if mail already exists
        # source: https://pydoc.dev/werkzeug/latest/werkzeug.security.html#check_password_hash
        # and https://werkzeug.palletsprojects.com/en/2.3.x/utils/
        username = request.form["username"]
        confirmation = request.form["confirm"]
        password_input = request.form["password"]

        if confirmation != password_input:
            db.close()
            return render_template("register.html", message = 
                                   "Make sure that both passwords are the same")

        password = generate_password_hash(request.form["password"], "scrypt")
        get_mail = db.execute("SELECT username FROM users WHERE username = ?", (username,))
        print(get_mail.fetchone())
        print(username)
        print(password)

        if get_mail.fetchone() is None:
            # Add mail and hash to the database and
            # return login.html with a success message
            db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", (username, password))
            db.commit()
            db.close()
            return render_template("login.html", message =
                                   "You have succesfuly created an account. You can login now.")

        # If mail exists in the database, render register.html again
        # and display a failed message
        return render_template("register.html", message = "Username already exists.")
        # Check if user contains special characters
    return render_template("register.html")

# Load Index
@app.route("/index", methods=["GET", "POST"])
@flask_login.login_required
def index():
    """Load Index."""
    return render_template("index.html")

# load detection
@app.route("/start", methods=["GET", "POST"])
@flask_login.login_required
def start():
    """Start detecting objects."""
    return render_template("detection.html")

# logout user
@app.route('/logout', methods=["GET", "POST"])
def logout():
    """Log out user."""
    flask_login.logout_user()
    return render_template("login.html", message = "You have logged out.")

# User history of detections
@app.route("/history", methods=["GET", "POST"])
@flask_login.login_required
def history():
    """Load up history page."""
    # get current user's id
    # Sources: https://stackoverflow.com/questions/47952830/flask-login-current-user and
    # https://flask-login.readthedocs.io/en/latest/#flask_login.current_user
    get_username = flask_login.current_user.id
    db = sqlite3.connect("database.db")
    db.row_factory = dict_factory

    # Clear history
    if request.method == "POST":
        db.execute("DELETE FROM detections WHERE username = ?", (get_username,))
        db.commit()
        db.close()
        return render_template("history.html")

    # Get detects db that corresponds to the user
    get_db = db.execute("SELECT * FROM detections WHERE username = ?", (get_username,))
    get_db = get_db.fetchall()
    get_db.reverse()
    print(get_db)
    db.close()
    return render_template("history.html", database = get_db)

# Get detection stats and add the mto the database
@app.route("/stats", methods=["POST"])
def stats():
    """Receive data and add to database."""
    receive = request.get_json()
    get_username = flask_login.current_user.id
    db = sqlite3.connect("database.db")
    db.row_factory = dict_factory

    # Add to database
    for object in receive["object"]:
        db.execute("INSERT INTO detections (username, label, confidence, date, time) VALUES(?, ?, ?, ?, ?)", (get_username, object["label"], round(object["confidence"],2), receive["date"], receive["time"]))
        db.commit()

    db.close()
    return "Nothing"

# Check if the user tries to access without authorization
@login_manager.unauthorized_handler
def unauthorized_handler():
    """Handle anauthorized tries."""
    return render_template("login.html", message="You need to login first.")

if __name__ == "__main__":
    app.run(debug = True)
