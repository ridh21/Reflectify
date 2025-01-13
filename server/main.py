from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import openpyxl
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_single_sheet(wb, sheet_name):
    sheet = wb[sheet_name]
    data = []
    for row in sheet.iter_rows(values_only=True):
        data.append(row)
    
    df = pd.DataFrame(data)
    if df.empty:
        return pd.DataFrame()
    
    header_row_index = 1
    for idx, row in df.iterrows():
        if row.notna().any():
            header_row_index = idx
            break
    
    df.columns = df.iloc[header_row_index]
    df = df.iloc[header_row_index + 1:]
    df = df.reset_index(drop=True)
    
    return df

def get_normalized_day(day_value):
    day_mapping = {
        'MON': 'Monday', 'MONDAY': 'Monday',
        'TUE': 'Tuesday', 'TUESDAY': 'Tuesday',
        'WED': 'Wednesday', 'WEDNESDAY': 'Wednesday',
        'THU': 'Thursday', 'THURSDAY': 'Thursday',
        'FRI': 'Friday', 'FRIDAY': 'Friday',
        'SAT': 'Saturday', 'SATURDAY': 'Saturday'
    }
    return day_mapping.get(day_value.strip().upper())

def check_if_lab(row_idx, faculty_column, current_value):
    prev_value = faculty_column.iloc[row_idx - 1] if row_idx > 0 else None
    next_value = faculty_column.iloc[row_idx + 1] if row_idx < len(faculty_column) - 1 else None
    return (prev_value == current_value) or (next_value == current_value)

def create_schedule_entry(cell_value, time_slot, row_idx, faculty_column):
    try:
        is_lab = check_if_lab(row_idx, faculty_column, cell_value)
        return {
            'subject': cell_value,
            'type': 'Lab' if is_lab else 'Lecture',
            'time_slot': int(time_slot) if pd.notna(time_slot) else 0
        }
    except:
        return None

def create_faculty_schedule_dict(processed_df):
    faculty_master = {}
    faculty_names = []
    
    for col in processed_df.columns[2:]:
        if pd.notna(col) and not str(col).isdigit():
            faculty_names.append(col)
    
    for faculty in faculty_names:
        faculty_master[faculty] = {day: [] for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
    
    for faculty in faculty_names:
        faculty_column = processed_df[faculty]
        
        for row_idx in range(len(faculty_column)):
            try:
                cell_value = str(faculty_column.iloc[row_idx]).strip()
                if pd.isna(cell_value) or cell_value == '':
                    continue
                
                day_value = str(processed_df.iloc[row_idx, 0]).strip().upper()
                time_slot = processed_df.iloc[row_idx, 1]
                
                day = get_normalized_day(day_value)
                if not day:
                    continue
                
                schedule_entry = create_schedule_entry(
                    cell_value, 
                    time_slot, 
                    row_idx, 
                    faculty_column
                )
                
                if schedule_entry:
                    faculty_master[faculty][day].append(schedule_entry)
                    
            except IndexError:
                continue
    
    return faculty_master

def parse_subject_info(subject_str):
    try:
        parts = subject_str.strip().split()
        if len(parts) < 2:
            return None
            
        subject_code = parts[0]
        class_info = ''.join(parts[1:])
        
        semester = int(class_info[0])
        division = class_info[1]
        batch = class_info[2] if len(class_info) > 2 else None
        
        return {
            'code': subject_code,
            'semester': semester,
            'division': division,
            'batch': batch
        }
    except:
        return None

def transform_to_required_format(faculty_schedules):
    transformed_data = []
    
    for sheet, faculty_data in faculty_schedules.items():
        for faculty_code, schedule in faculty_data.items():
            for day, slots in schedule.items():
                for slot in slots:
                    try:
                        subject_info = parse_subject_info(slot['subject'])
                        if subject_info:
                            entry = {
                                "subject_code": subject_info['code'],
                                "semester": subject_info['semester'],
                                "division": subject_info['division'],
                                "batch": subject_info['batch'],
                                "is_lab": slot['type'] == 'Lab',
                                "time_slot": slot['time_slot'],
                                "day": day,
                                "faculty_code": faculty_code
                            }
                            transformed_data.append(entry)
                    except:
                        continue
    
    return transformed_data

@app.route('/process-faculty-data/', methods=['POST'])
def process_faculty_data():
    try:
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            }), 400

        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        file.save(filepath)
        wb = openpyxl.load_workbook(filepath)
        
        processed_data = {}
        for sheet_name in wb.sheetnames:
            processed_df = process_single_sheet(wb, sheet_name)
            faculty_schedule = create_faculty_schedule_dict(processed_df)
            processed_data[sheet_name] = faculty_schedule

        transformed_data = transform_to_required_format(processed_data)
        
        return jsonify({
            'status': 'success',
            'data': transformed_data
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(port=8000, debug=True)