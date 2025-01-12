from flask import Flask, request, jsonify
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import openpyxl
from io import BytesIO
import os
from werkzeug.utils import secure_filename

# Add these configurations at the top after imports
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)

# Add this to your Flask app configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_single_sheet(wb, sheet_name):
    sheet = wb[sheet_name]
    merged_ranges = sheet.merged_cells.ranges
    
    new_wb = openpyxl.Workbook()
    new_sheet = new_wb.active
    
    # Copy data
    for row in sheet.rows:
        for cell in row:
            new_sheet.cell(row=cell.row, column=cell.column, value=cell.value)
    
    # Process merged cells
    for merged_range in merged_ranges:
        value = sheet.cell(merged_range.min_row, merged_range.min_col).value
        for row in range(merged_range.min_row, merged_range.max_row + 1):
            for col in range(merged_range.min_col, merged_range.max_col + 1):
                new_sheet.cell(row=row, column=col, value=value)
    
    df = pd.DataFrame(new_sheet.values)
    df.columns = df.iloc[1]
    df = df.iloc[2:]
    df = df.reset_index(drop=True)
    
    return df

def create_faculty_schedule_dict(processed_df):
    faculty_master = {}
    faculty_names = [col for col in processed_df.columns[2:] if pd.notna(col) and not str(col).isdigit()]
    
    for faculty in faculty_names:
        faculty_master[faculty] = {
            'Monday': [], 'Tuesday': [], 'Wednesday': [],
            'Thursday': [], 'Friday': [], 'Saturday': []
        }
    
    day_mapping = {
        'MON': 'Monday', 'MONDAY': 'Monday',
        'TUES': 'Tuesday', 'TUESDAY': 'Tuesday',
        'WED': 'Wednesday', 'WEDNESDAY': 'Wednesday',
        'THUR': 'Thursday', 'THURSDAY': 'Thursday',
        'FRI': 'Friday', 'FRIDAY': 'Friday',
        'SAT': 'Saturday', 'SATURDAY': 'Saturday'
    }
    
    processed_labs = set()
    
    for faculty in faculty_names:
        faculty_column = processed_df[faculty]
        
        for row_idx in range(len(faculty_column)):
            cell_value = faculty_column.iloc[row_idx]
            day_value = str(processed_df.iloc[row_idx, 0]).strip().upper()
            time_slot = processed_df.iloc[row_idx, 1]
            day = day_mapping.get(day_value)
            
            if pd.notna(cell_value) and cell_value != '' and day is not None:
                is_lab = False
                if row_idx > 0 and faculty_column.iloc[row_idx-1] == cell_value:
                    is_lab = True
                    lab_key = f"{faculty}_{day}_{cell_value}_{row_idx-1}"
                    if lab_key in processed_labs:
                        continue
                    processed_labs.add(lab_key)
                elif row_idx < len(faculty_column)-1 and faculty_column.iloc[row_idx+1] == cell_value:
                    is_lab = True
                    lab_key = f"{faculty}_{day}_{cell_value}_{row_idx}"
                    if lab_key in processed_labs:
                        continue
                    processed_labs.add(lab_key)
                
                schedule_entry = {
                    'subject': cell_value,
                    'type': 'Lab' if is_lab else 'Lecture',
                    'time_slot': int(time_slot)
                }
                
                faculty_master[faculty][day].append(schedule_entry)
    
    return faculty_master




@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Faculty Schedule Processor API'})

@app.route('/process-faculty-data/', methods=['POST'])
def process_faculty_data():
    print("This is the request", request.files)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            wb = openpyxl.load_workbook(filepath)
            processed_matrices = {}
            faculty_schedules = {}
            
            for sheet_name in wb.sheetnames:
                processed_df = process_single_sheet(wb, sheet_name)
                processed_matrices[sheet_name] = processed_df
                faculty_schedules[sheet_name] = create_faculty_schedule_dict(processed_df)
            
            return jsonify(faculty_schedules)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up the uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(port=8000, debug=True)
