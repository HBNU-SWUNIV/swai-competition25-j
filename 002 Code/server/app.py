from flask import Flask
from flask_cors import CORS
from controller.order_controller import order_bp
from controller.product_controller import product_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
CORS(order_bp, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
CORS(product_bp, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

app.register_blueprint(order_bp)
app.register_blueprint(product_bp)

@app.route('/')
def home():
    return 'Hello, Flask!'

if __name__ == '__main__':
    app.run(port=8170, debug=True)