"""Import Flask."""
from flask import Flask, render_template

# app
app = Flask(__name__)

@app.route("/", methods=["GET", "Method"])
def index():
    """Render Index."""
    return render_template("index.html")







if __name__ == "__main__":
    app.run()
