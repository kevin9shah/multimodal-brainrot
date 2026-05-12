import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# ==========================================
# 1. Configuration & Hyperparameters
# ==========================================
CSV_PATH = 'enhanced_fever_medicine_recommendation.csv'
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001

# Define our feature types based on the CSV
NUMERICAL_COLS = ['Temperature', 'Age', 'BMI', 'Humidity', 'AQI', 'Heart_Rate']
CATEGORICAL_COLS = [
    'Fever_Severity', 'Gender', 'Headache', 'Body_Ache', 'Fatigue', 
    'Chronic_Conditions', 'Allergies', 'Smoking_History', 'Alcohol_Consumption', 
    'Physical_Activity', 'Diet_Type', 'Blood_Pressure', 'Previous_Medication'
]
TARGET_COL = 'Recommended_Medication'

# ==========================================
# 2. Data Loading & Preprocessing
# ==========================================
print("Loading and preprocessing data...")
df = pd.read_csv(CSV_PATH)

# Encode Target
target_encoder = LabelEncoder()
df[TARGET_COL] = target_encoder.fit_transform(df[TARGET_COL])
num_classes = len(target_encoder.classes_)

# Scale Numerical Features
scaler = StandardScaler()
df[NUMERICAL_COLS] = scaler.fit_transform(df[NUMERICAL_COLS])

# Encode Categorical Features to Integers (for Embedding Layers)
cat_encoders = {}
cat_dims = [] # To store the number of unique values for each category

for col in CATEGORICAL_COLS:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    cat_encoders[col] = le
    cat_dims.append(len(le.classes_))

# ==========================================
# 3. PyTorch Dataset Definition
# ==========================================
class FeverDataset(Dataset):
    def __init__(self, dataframe):
        self.num_data = dataframe[NUMERICAL_COLS].values.astype(np.float32)
        self.cat_data = dataframe[CATEGORICAL_COLS].values.astype(np.int64)
        self.targets = dataframe[TARGET_COL].values.astype(np.int64)

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return self.num_data[idx], self.cat_data[idx], self.targets[idx]

# Split data
train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

train_dataset = FeverDataset(train_df)
test_dataset = FeverDataset(test_df)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

# ==========================================
# 4. Multimodal-Ready Neural Network Model
# ==========================================
class TabularEmbeddingModel(nn.Module):
    def __init__(self, cat_dims, num_numerical_cols, num_classes):
        super(TabularEmbeddingModel, self).__init__()
        
        # Create an Embedding Layer for each categorical column
        # Rule of thumb for embedding size: min(50, num_categories // 2 + 1)
        self.embeddings = nn.ModuleList([
            nn.Embedding(num_embeddings=dim, embedding_dim=min(50, (dim + 1) // 2))
            for dim in cat_dims
        ])
        
        # Calculate total dimension after embeddings are concatenated
        total_emb_dim = sum(min(50, (dim + 1) // 2) for dim in cat_dims)
        
        # Total input dimension = embedded categories + numerical features
        input_dim = total_emb_dim + num_numerical_cols
        
        # This is the "Assembly Line" we talked about
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
        # THIS is the layer that outputs our "Tabular Embedding" (e.g., 16 numbers)
        # In the future, we will extract the output of this layer and combine it with Images/Audio
        self.tabular_embedding_layer = nn.Linear(64, 16) 
        
        # Final Decision Layer (Only used when evaluating the tabular data alone)
        self.output_layer = nn.Linear(16, num_classes)

    def forward(self, num_x, cat_x):
        # 1. Pass categorical data through embedding layers
        emb_outputs = []
        for i, emb_layer in enumerate(self.embeddings):
            emb_outputs.append(emb_layer(cat_x[:, i]))
            
        # 2. Concatenate all embeddings together
        cat_embedded = torch.cat(emb_outputs, dim=1)
        
        # 3. Concatenate numerical data with the embedded categorical data
        x = torch.cat([num_x, cat_embedded], dim=1)
        
        # 4. Pass through hidden layers
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout(x)
        
        # 5. Extract Tabular Embedding! (The 16 numbers)
        tabular_embedding = self.tabular_embedding_layer(x)
        tabular_embedding = self.relu(tabular_embedding)
        
        # 6. Final prediction
        out = self.output_layer(tabular_embedding)
        return out

model = TabularEmbeddingModel(cat_dims, len(NUMERICAL_COLS), num_classes)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# ==========================================
# 5. Training Loop
# ==========================================
print("\nStarting Training...")
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for num_x, cat_x, labels in train_loader:
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(num_x, cat_x)
        loss = criterion(outputs, labels)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        
        # Calculate accuracy
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
    epoch_acc = 100 * correct / total
    print(f"Epoch {epoch+1}/{EPOCHS} - Loss: {running_loss/len(train_loader):.4f} - Accuracy: {epoch_acc:.2f}%")

print("\nModel trained successfully!")

# Save the model weights
torch.save(model.state_dict(), 'tabular_model_weights.pth')
print("Model saved to 'tabular_model_weights.pth'")
print("\nThis model is now fully prepared for multimodal integration. You can strip the 'output_layer' later to extract the 16-dimensional tabular embeddings!")
