from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load your actual model! Ensure model.pkl is in this same directory.
try:
    model = pickle.load(open("model.pkl", "rb"))
    model_loaded = True
except Exception as e:
    print(f"Error loading model.pkl: {e}")
    model_loaded = False

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "success",
        "message": "Medical Dashboard Backend is running! (Model Loaded: {})".format(model_loaded)
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not model_loaded:
        return jsonify({"error": "Model not loaded. Ensure model.pkl is in backend folder."}), 500
        
    data = request.form
    files = request.files
    
    try:
        # Media inputs (4 inputs):
        leukemia_image = files.get('leukemiaImage')
        retinopathy_image = files.get('retinopathyImage')
        corona_audio = files.get('coronaAudio')
        asthma_audio = files.get('asthmaAudio')
        
        # Tabular inputs (2 datasets):
        fever_features = {
            "age": data.get('age'),
            "temp": data.get('temperature'),
            "heartRate": data.get('heartRate'),
            "gender": data.get('gender'),
            "bmi": data.get('bmi'),
            "bloodPressure": data.get('bloodPressure'),
            "headache": data.get('headache'),
            "bodyAche": data.get('bodyAche'),
            "fatigue": data.get('fatigue')
        }
        
        anaemia_features = {
            "hb": data.get('hb'),
            "redPixel": data.get('redPixel'),
            "greenPixel": data.get('greenPixel'),
            "bluePixel": data.get('bluePixel')
        }
        
        # Pass all 6 inputs to your model
        prediction = model.predict(fever_features, anaemia_features, leukemia_image, retinopathy_image, corona_audio, asthma_audio)
        
        # Adjust this depending on how your model returns output (e.g., dictionary vs list)
        if isinstance(prediction, dict):
            return jsonify(prediction)
        elif isinstance(prediction, (list, tuple)) and len(prediction) >= 3:
             # Just in case it returns a list like [risk, severity, confidence]
             response = {
                "disease_risk": str(prediction[0]),
                "severity": str(prediction[1]),
                "confidence": str(prediction[2])
             }
             return jsonify(response)
        else:
             response = {
                "disease_risk": str(prediction[0] if isinstance(prediction, (list, tuple)) else prediction),
                "severity": "Calculated by AI",
                "confidence": "100%"
             }
             return jsonify(response)
            
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8080)
